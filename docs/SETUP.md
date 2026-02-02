# 🚀 Guía de Instalación y Configuración

## Prerrequisitos

- Node.js 18+ y npm
- PostgreSQL 14+
- Git

## Instalación del Backend

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar base de datos

Crear archivo `.env` en `backend/`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/dllf_dashboard?schema=public"
JWT_SECRET="tu-secret-key-super-segura-cambiar-en-produccion"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="tu-refresh-secret-key-super-segura"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar base de datos PostgreSQL

```bash
# Crear base de datos
createdb dllf_dashboard

# O usando psql
psql -U postgres
CREATE DATABASE dllf_dashboard;
```

### 4. Ejecutar migraciones

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. (Opcional) Crear usuario administrador inicial

Puedes usar Prisma Studio para crear el primer usuario:

```bash
npx prisma studio
```

O crear un script de seed (ver sección de Seeds).

### 6. Iniciar servidor

```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3001`

## Instalación del Frontend

### 1. Instalar dependencias

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env.local` en `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Crear Usuario Administrador Inicial

### Opción 1: Usando Prisma Studio

```bash
cd backend
npx prisma studio
```

1. Abre la tabla `User`
2. Crea un nuevo registro con:
   - email: admin@dllf.com
   - password: (usa bcrypt para hashear, ver script abajo)
   - firstName: Admin
   - lastName: User
   - role: ADMIN
   - isActive: true

### Opción 2: Script de Seed

Crear `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dllf.com' },
    update: {},
    create: {
      email: 'admin@dllf.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Admin user created:', admin)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Agregar a `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Ejecutar:

```bash
npx prisma db seed
```

## Verificación

1. Abre `http://localhost:3000`
2. Deberías ser redirigido a `/login`
3. Inicia sesión con el usuario administrador creado
4. Verifica que puedas acceder al dashboard

## Comandos Útiles

### Backend

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Prisma
npx prisma generate          # Generar cliente Prisma
npx prisma migrate dev        # Crear migración
npx prisma migrate deploy     # Aplicar migraciones en producción
npx prisma studio            # Abrir Prisma Studio
```

### Frontend

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start

# Linting
npm run lint
```

## Solución de Problemas

### Error: "Cannot find module '@prisma/client'"

```bash
cd backend
npx prisma generate
```

### Error: "Database connection failed"

- Verifica que PostgreSQL esté corriendo
- Verifica la URL en `.env`
- Verifica credenciales de la base de datos

### Error: "JWT_SECRET is not defined"

- Asegúrate de tener el archivo `.env` en `backend/`
- Verifica que todas las variables estén definidas

### Error de CORS

- Verifica `FRONTEND_URL` en `.env` del backend
- Asegúrate de que coincida con la URL del frontend

## Producción

### Variables de Entorno de Producción

**Backend `.env`:**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="[generar-secret-seguro]"
JWT_REFRESH_SECRET="[generar-secret-seguro]"
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://dashboard.dllf.com
```

**Frontend `.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://api.dllf.com
```

### Build de Producción

**Backend:**
```bash
npm run build
npm run start:prod
```

**Frontend:**
```bash
npm run build
npm run start
```

### Recomendaciones de Seguridad

1. Usar HTTPS en producción
2. Cambiar todos los secrets por valores seguros
3. Configurar rate limiting
4. Habilitar logging y monitoreo
5. Backup regular de base de datos
6. Usar variables de entorno seguras (no commitear `.env`)

