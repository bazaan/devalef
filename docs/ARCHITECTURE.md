# 🏗️ Arquitectura del Sistema DLLF Dashboard

## Visión General

El DLLF Dashboard es una aplicación web full-stack diseñada para la gestión interna de equipos de desarrollo. La arquitectura sigue principios de separación de responsabilidades, escalabilidad y seguridad.

## Stack Tecnológico

### Backend
- **Framework**: NestJS 10.x (Node.js/TypeScript)
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: JWT (JSON Web Tokens) con refresh tokens
- **Validación**: class-validator y class-transformer
- **Seguridad**: bcrypt para hash de contraseñas, Passport.js para estrategias de autenticación

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, TailwindCSS
- **Estado**: React Context API
- **HTTP Client**: Axios con interceptores
- **Iconos**: Lucide React

## Arquitectura del Backend

### Estructura de Módulos

```
backend/
├── src/
│   ├── auth/          # Autenticación y autorización
│   ├── users/         # Gestión de usuarios
│   ├── tasks/         # Sistema de tareas
│   ├── calendar/      # Calendarios
│   ├── audit/         # Bitácora de auditoría
│   └── prisma/        # Servicio de base de datos
```

### Módulos Principales

#### 1. Auth Module
- **Responsabilidad**: Autenticación y autorización
- **Estrategias**: JWT Strategy, Local Strategy
- **Guards**: JwtAuthGuard, RolesGuard
- **Endpoints**:
  - `POST /auth/login` - Inicio de sesión
  - `POST /auth/refresh` - Renovar token
  - `POST /auth/logout` - Cerrar sesión

#### 2. Users Module
- **Responsabilidad**: CRUD de usuarios
- **Permisos**: Solo ADMIN
- **Endpoints**:
  - `GET /users` - Listar usuarios
  - `GET /users/me` - Perfil del usuario actual
  - `GET /users/workload` - Estadísticas de carga de trabajo
  - `POST /users` - Crear usuario
  - `PATCH /users/:id` - Actualizar usuario
  - `DELETE /users/:id` - Eliminar usuario

#### 3. Tasks Module
- **Responsabilidad**: Gestión de tareas
- **Permisos**: 
  - ADMIN: CRUD completo
  - DEVELOPER: Solo lectura/actualización de estado de tareas asignadas
- **Endpoints**:
  - `GET /tasks` - Listar tareas (filtradas por rol)
  - `GET /tasks/stats` - Estadísticas
  - `GET /tasks/upcoming` - Tareas próximas
  - `POST /tasks` - Crear tarea (solo ADMIN)
  - `PATCH /tasks/:id` - Actualizar tarea
  - `DELETE /tasks/:id` - Eliminar tarea (solo ADMIN)

#### 4. Calendar Module
- **Responsabilidad**: Eventos de calendario
- **Permisos**: Lectura para todos, escritura solo ADMIN
- **Endpoints**:
  - `GET /calendar` - Listar eventos
  - `GET /calendar/type/:eventType` - Filtrar por tipo
  - `POST /calendar` - Crear evento (solo ADMIN)
  - `PATCH /calendar/:id` - Actualizar evento (solo ADMIN)
  - `DELETE /calendar/:id` - Eliminar evento (solo ADMIN)

#### 5. Audit Module
- **Responsabilidad**: Bitácora de auditoría
- **Permisos**: Solo ADMIN
- **Endpoints**:
  - `GET /audit` - Listar logs
  - `GET /audit/entity/:entityType/:entityId` - Logs de una entidad
  - `GET /audit/user/:userId` - Logs de un usuario
  - `GET /audit/action/:action` - Logs de una acción

## Modelo de Datos

### Entidades Principales

#### User
- `id`: UUID
- `email`: String (único)
- `password`: String (hasheado)
- `firstName`: String
- `lastName`: String
- `role`: Enum (ADMIN, DEVELOPER)
- `isActive`: Boolean
- `createdAt`, `updatedAt`: DateTime

#### Task
- `id`: UUID
- `title`: String
- `description`: String (opcional)
- `priority`: Enum (HIGH, MEDIUM, LOW)
- `status`: Enum (PENDING, IN_PROGRESS, COMPLETED)
- `dueDate`: DateTime (opcional)
- `assigneeId`: UUID (opcional, FK a User)
- `creatorId`: UUID (FK a User)
- `devStartDate`, `devEndDate`, `testingStartDate`: DateTime (opcionales)
- `createdAt`, `updatedAt`: DateTime

#### CalendarEvent
- `id`: UUID
- `title`: String
- `description`: String (opcional)
- `startDate`: DateTime
- `endDate`: DateTime (opcional)
- `eventType`: String (DEVELOPMENT, DELIVERY, MILESTONE, BLOCKER)
- `isBlocked`: Boolean
- `createdById`: UUID (FK a User)
- `createdAt`, `updatedAt`: DateTime

#### AuditLog
- `id`: UUID
- `userId`: UUID (FK a User)
- `action`: String
- `entityType`: String (opcional)
- `entityId`: UUID (opcional)
- `details`: JSON (opcional)
- `ipAddress`: String (opcional)
- `userAgent`: String (opcional)
- `createdAt`: DateTime

## Seguridad

### Autenticación
1. **Login**: Email + contraseña
2. **Validación**: bcrypt.compare para verificar contraseña
3. **Tokens**: 
   - Access Token (15 minutos)
   - Refresh Token (7 días)
4. **Almacenamiento**: LocalStorage en frontend

### Autorización
- **Guards**: Protección de rutas a nivel de controlador
- **Roles**: Decorador @Roles() para definir permisos
- **Validación**: RolesGuard verifica rol del usuario

### Protecciones
- Contraseñas hasheadas con bcrypt (10 rounds)
- Validación de entrada con class-validator
- Protección contra inyección SQL (Prisma ORM)
- CORS configurado
- Headers de seguridad

## Arquitectura del Frontend

### Estructura

```
frontend/
├── app/              # Next.js App Router
│   ├── login/       # Página de login
│   ├── dashboard/   # Dashboard principal
│   ├── tasks/       # Gestión de tareas
│   ├── calendar/    # Calendarios
│   ├── users/       # Gestión de usuarios (solo ADMIN)
│   └── audit/       # Bitácora (solo ADMIN)
├── components/      # Componentes reutilizables
└── lib/            # Utilidades y configuración
```

### Flujo de Autenticación

1. Usuario ingresa credenciales en `/login`
2. Frontend envía petición a `/auth/login`
3. Backend valida y retorna tokens
4. Tokens se almacenan en localStorage
5. Interceptor de Axios agrega token a todas las peticiones
6. Si token expira, se usa refresh token automáticamente
7. Si refresh falla, redirige a `/login`

### Protección de Rutas

- `Layout` component verifica autenticación
- Redirige a `/login` si no hay usuario
- Oculta elementos según rol del usuario

### Vista "Océano" de Tareas

- Grid responsivo con `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`
- Cards con bordes de colores según prioridad
- Ordenamiento: Prioridad → Fecha límite → Estado
- Animaciones suaves con CSS transitions

## Flujos Principales

### Crear Tarea (Admin)
1. Click en "Nueva Tarea"
2. Modal con formulario
3. Validación en frontend
4. POST `/tasks` con datos
5. Backend crea tarea y registra en bitácora
6. Frontend actualiza lista

### Actualizar Estado (Developer)
1. Developer ve solo sus tareas asignadas
2. Select de estado en TaskCard
3. PATCH `/tasks/:id` con nuevo estado
4. Backend valida permisos y actualiza
5. Registro en bitácora
6. Frontend actualiza UI

### Ver Bitácora (Admin)
1. Solo visible para ADMIN
2. GET `/audit` con paginación
3. Filtros por acción
4. Tabla con detalles expandibles

## Escalabilidad

### Backend
- Módulos independientes y desacoplados
- Servicios reutilizables
- Prisma permite migraciones fáciles
- Preparado para microservicios si es necesario

### Frontend
- Componentes modulares
- Lazy loading con Next.js
- Optimización de imágenes y assets
- Código splitting automático

### Base de Datos
- Índices en campos frecuentemente consultados
- Relaciones bien definidas
- Normalización adecuada
- Preparado para réplicas de lectura

## Mejoras Futuras

1. **Notificaciones en tiempo real**: WebSockets para alertas
2. **Dashboard avanzado**: Gráficos y métricas
3. **Exportación de datos**: PDF/Excel de reportes
4. **Integración con Git**: Sincronización automática
5. **API GraphQL**: Alternativa a REST
6. **Tests**: Unit tests y E2E tests
7. **CI/CD**: Pipeline automatizado
8. **Docker**: Containerización

