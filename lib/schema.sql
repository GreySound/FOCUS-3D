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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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
create table if not exists suscriptores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null,                       -- WhatsApp normalizado (solo dígitos)
  email text,
  canal text not null default 'whatsapp',
  token text not null unique,                   -- código de registro que el cliente envía por WhatsApp
  cupon text not null,                          -- cupón único 10% (lo entrega el admin por WhatsApp)
  estado text not null default 'pendiente',     -- pendiente | verificado
  acepta_promos boolean not null default true,  -- consentimiento (LFPDPPP)
  created_at timestamptz not null default now()
);
create index if not exists idx_suscriptores_telefono on suscriptores(telefono);

-- Datos personales: el alta y la gestión se hacen SOLO desde el servidor con la
-- service role key. Sin políticas públicas, la clave anónima no puede leerlos.
alter table suscriptores enable row level security;
