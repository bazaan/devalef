# 🚀 DLLF Dashboard Interno

Dashboard web moderno, seguro y escalable para gestión de equipos de desarrollo.

## 📋 Características

- ✅ Autenticación JWT con roles (Admin/Desarrollador)
- ✅ Gestión de usuarios y permisos
- ✅ Sistema de tareas priorizadas con vista "océano"
- ✅ Calendarios de desarrollo y entregas
- ✅ Bitácora de auditoría completa
- ✅ UI moderna con Next.js y TailwindCSS
- ✅ API REST con NestJS
- ✅ Base de datos PostgreSQL

## 🏗️ Arquitectura

```
DASHBOARD/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── auth/     # Autenticación JWT
│   │   ├── users/    # Gestión de usuarios
│   │   ├── tasks/    # Sistema de tareas
│   │   ├── calendar/ # Calendarios
│   │   └── audit/    # Bitácora
│   └── prisma/       # Modelos de BD
├── frontend/         # Next.js 14 App Router
│   ├── app/          # Rutas y páginas
│   ├── components/   # Componentes React
│   └── lib/          # Utilidades y API client
└── docs/             # Documentación
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### Instalación

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run start:dev

# Frontend
cd frontend
npm install
npm run dev
```

### Variables de Entorno

Ver `.env.example` en cada directorio.

## 🔐 Roles y Permisos

- **Administrador**: Acceso completo al sistema
- **Desarrollador**: Solo lectura/escritura de tareas asignadas

## 📚 Documentación

Ver `/docs` para documentación detallada de arquitectura y APIs.

# devalef
