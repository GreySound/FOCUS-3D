# Focus 3D — Sitio web completo

Stack: **Next.js 16** + **Supabase** + **Vercel** + **Tailwind CSS**

---

## Instalación paso a paso

### 1. Requisitos previos
Instala **Node.js** (versión 18 o superior) desde https://nodejs.org

### 2. Descargar y preparar el proyecto
```bash
# Entra a la carpeta del proyecto
cd focus3d

# Instala las dependencias
npm install
```

### 3. Crear cuenta en Supabase (gratis)
1. Ve a https://supabase.com y crea una cuenta
2. Crea un nuevo proyecto (guarda la contraseña)
3. Espera ~2 minutos a que termine de configurarse

### 4. Configurar la base de datos
1. En tu proyecto Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido de `lib/schema.sql`
4. Ejecuta con el botón **Run**

### 5. Obtener las credenciales de Supabase
En tu proyecto Supabase ve a **Settings → API**:
- Copia **Project URL** → es tu `NEXT_PUBLIC_SUPABASE_URL`
- Copia **anon public key** → es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copia **service_role key** → es tu `SUPABASE_SERVICE_ROLE_KEY`

### 6. Crear archivo de configuración
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local
```
Abre `.env.local` y llena tus credenciales reales.

### 7. Correr en tu computadora
```bash
npm run dev
```
Abre http://localhost:3000

### 8. Acceder al panel admin
Ve a http://localhost:3000/login  
Contraseña: la que pusiste en `ADMIN_PASSWORD` del `.env.local`

---

## Subir a Vercel (gratis)

1. Crea cuenta en https://vercel.com
2. Conecta tu cuenta de GitHub
3. Sube este proyecto a un repositorio de GitHub
4. En Vercel: **New Project** → importa el repositorio
5. En **Environment Variables** agrega las mismas variables de `.env.local`
6. Haz clic en **Deploy** — listo en ~2 minutos

---

## Estructura del proyecto

```
focus3d/
├── app/
│   ├── page.tsx              ← Página de inicio
│   ├── catalogo/             ← Catálogo público
│   ├── contacto/             ← Formulario de contacto
│   └── admin/
│       ├── page.tsx          ← Dashboard admin
│       ├── productos/        ← Gestión de productos
│       ├── pedidos/          ← Gestión de pedidos
│       └── mensajes/         ← Bandeja de mensajes
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   └── admin/
│       └── ProductForm.tsx   ← Formulario crear/editar producto
├── lib/
│   ├── supabase.ts           ← Conexión a Supabase + tipos
│   └── schema.sql            ← Esquema de base de datos
└── .env.example              ← Plantilla de variables de entorno
```

---

## Personalizar

- **Links de Instagram y Mercado Libre**: busca `instagram.com` y `mercadolibre.com.mx` en el código y reemplaza con tus URLs reales
- **Número de WhatsApp**: busca `521XXXXXXXXXX` y reemplaza con tu número (formato: 521XXXXXXXXXX sin espacios ni guiones)
- **Contraseña admin**: cambia `ADMIN_PASSWORD` en `.env.local`
- **Colores**: en `tailwind.config.js` en la sección `colors`
