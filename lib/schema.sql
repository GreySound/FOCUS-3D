-- ════════════════════════════════════════════
-- Focus 3D — Schema de base de datos
-- Pega esto en el SQL Editor de Supabase
-- ════════════════════════════════════════════

-- Productos
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  linea text check (linea in ('Essentials','Statement','Signature','Custom','B2B')),
  precio_min int not null,
  precio_max int not null,
  stock int default 5,
  estado text default 'disponible' check (estado in ('disponible','agotado','bajo_pedido')),
  imagenes text[] default '{}',
  en_promocion boolean not null default false,   -- destacar como promoción en la tienda
  precio_promo int,                              -- precio rebajado opcional (si null, solo se marca como promo)
  promo_etiqueta text,                           -- texto corto de la promo (ej. "-20%", "2x1")
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Si la tabla productos ya existía, añade las columnas de promoción:
alter table productos add column if not exists en_promocion boolean not null default false;
alter table productos add column if not exists precio_promo int;
alter table productos add column if not exists promo_etiqueta text;
-- (opcional) registra cuándo se avisó la promo a los suscriptores por WhatsApp:
alter table productos add column if not exists promo_notificada_at timestamptz;

-- Pedidos
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  nombre_cliente text not null,
  email text not null,
  telefono text,
  canal text check (canal in ('instagram','mercadolibre','whatsapp','web')),
  estado text default 'nuevo' check (estado in ('nuevo','en_proceso','listo','enviado','entregado')),
  total int,
  notas text,
  created_at timestamptz default now()
);

-- Items de pedido
create table if not exists pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid references pedidos(id) on delete cascade,
  producto_id uuid references productos(id),
  cantidad int default 1,
  precio_unitario int not null,
  acabado text
);

-- Mensajes de contacto
create table if not exists mensajes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  email text not null,
  telefono text,
  interes text,
  mensaje text,
  producto_ref uuid references productos(id),
  leido boolean default false,
  created_at timestamptz default now()
);

-- Trigger: actualiza updated_at en productos
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger productos_updated_at
  before update on productos
  for each row execute function update_updated_at();

-- ════════════════════════════════════════════
-- Storage bucket para imágenes de productos
-- ════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict do nothing;

-- Lectura pública de imágenes (la tienda las muestra).
create policy "Imágenes públicas" on storage.objects
  for select using (bucket_id = 'productos');

-- ⚠️ La subida/borrado de imágenes se hace SOLO desde el servidor con la
-- SERVICE ROLE KEY (que ignora RLS). Por eso NO se crean políticas públicas
-- de insert/delete: así ningún visitante puede subir ni borrar archivos.
-- Si tu base ya tenía estas políticas permisivas, elimínalas:
drop policy if exists "Admin upload" on storage.objects;
drop policy if exists "Admin delete" on storage.objects;

-- ════════════════════════════════════════════
-- Row Level Security (RLS)
-- ════════════════════════════════════════════
alter table productos enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
alter table mensajes enable row level security;

-- Catálogo: lectura pública (lo muestra la tienda).
create policy "Productos públicos" on productos for select using (true);

-- Formulario de contacto: cualquiera puede ENVIAR un mensaje...
create policy "Insertar mensajes" on mensajes for insert with check (true);

-- ⚠️ ...pero NADIE puede leer/editar/borrar mensajes ni pedidos con la clave
-- pública: contienen datos personales de clientes (nombre, email, teléfono).
-- El panel admin los lee y modifica DESDE EL SERVIDOR con la SERVICE ROLE KEY
-- (que ignora RLS). Por eso 'pedidos', 'pedido_items' y la lectura/escritura
-- de 'mensajes' NO tienen políticas públicas.
--
-- Si tu base ya tenía políticas permisivas que exponían estos datos,
-- elimínalas para cerrar la fuga (ajusta los nombres si difieren):
drop policy if exists "Pedidos públicos" on pedidos;
drop policy if exists "Mensajes públicos" on mensajes;
drop policy if exists "Insertar pedidos" on pedidos;
drop policy if exists "Insertar items" on pedido_items;



-- ════════════════════════════════════════════
-- Suscriptores (cupón de bienvenida + difusión)
-- ════════════════════════════════════════════
-- El cupón se entrega por email y/o SMS (el suscriptor elige qué quiere dar:
-- email, teléfono o ambos). Si la API de WhatsApp algún día está disponible,
-- el código sigue compatible (lib/whatsapp.ts se mantiene), pero NO es requisito.
create table if not exists suscriptores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,                                -- móvil MX normalizado (52 + 10 dígitos). UNIQUE parcial: 1 cupón por número
  email text,                                   -- correo. UNIQUE parcial: 1 cupón por email
  canal text not null default 'email',          -- canal preferido (informativo): 'email' | 'sms' | 'ambos'
  token text not null unique,                   -- código de registro / clave de la página pública del cupón
  cupon text not null,                          -- cupón único 10% (BIENVENIDA-XXXXX)
  estado text not null default 'pendiente',     -- pendiente | verificado
  acepta_promos boolean not null default true,  -- consentimiento (LFPDPPP)
  created_at timestamptz not null default now()
);

-- Migración para bases existentes: el teléfono ya no es obligatorio.
-- Si tu instalación ya tenía la columna como NOT NULL, esto la libera.
alter table suscriptores alter column telefono drop not null;

-- Anti-duplicado: 1 cupón por canal. Usamos índices parciales para permitir
-- registrarse solo con teléfono O solo con email O con ambos, sin conflictos.
drop index if exists idx_suscriptores_telefono;
create unique index if not exists idx_suscriptores_telefono_unique
  on suscriptores(telefono) where telefono is not null;
create unique index if not exists idx_suscriptores_email_unique
  on suscriptores(lower(email)) where email is not null;

-- Tracking del cupón de bienvenida por canal + redención:
alter table suscriptores add column if not exists cupon_enviado_at timestamptz;        -- cuándo se envió (cualquier canal) — compat
alter table suscriptores add column if not exists cupon_enviado_email_at timestamptz;  -- cuándo se envió por email
alter table suscriptores add column if not exists cupon_enviado_sms_at timestamptz;    -- cuándo se envió por SMS
alter table suscriptores add column if not exists cupon_usado boolean not null default false;
alter table suscriptores add column if not exists cupon_usado_at timestamptz;

-- Datos personales: el alta y la gestión se hacen SOLO desde el servidor con la
-- service role key. Sin políticas públicas, la clave anónima no puede leerlos.
alter table suscriptores enable row level security;
