# 📡 Documentación de la API

## Base URL

```
http://localhost:3001
```

## Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticación

#### POST /auth/login
Iniciar sesión

**Request:**
```json
{
  "email": "admin@dllf.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@dllf.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

#### POST /auth/refresh
Renovar token de acceso

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Cerrar sesión (requiere autenticación)

---

### Usuarios

#### GET /users
Listar todos los usuarios (solo ADMIN)

**Response:**
```json
[
  {
    "id": "uuid",
    "email": "user@dllf.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "DEVELOPER",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "assignedTasks": 5
    }
  }
]
```

#### GET /users/me
Obtener perfil del usuario actual

**Response:**
```json
{
  "id": "uuid",
  "email": "user@dllf.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "DEVELOPER",
  "assignedTasks": [...]
}
```

#### GET /users/workload
Estadísticas de carga de trabajo (solo ADMIN)

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@dllf.com",
    "totalTasks": 5,
    "tasksByStatus": {
      "pending": 2,
      "inProgress": 3
    },
    "tasksByPriority": {
      "high": 1,
      "medium": 3,
      "low": 1
    }
  }
]
```

#### POST /users
Crear usuario (solo ADMIN)

**Request:**
```json
{
  "email": "newuser@dllf.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "DEVELOPER",
  "isActive": true
}
```

#### PATCH /users/:id
Actualizar usuario (solo ADMIN)

**Request:**
```json
{
  "firstName": "Jane Updated",
  "isActive": false
}
```

#### DELETE /users/:id
Eliminar usuario (solo ADMIN)

---

### Tareas

#### GET /tasks
Listar tareas
- ADMIN: Todas las tareas
- DEVELOPER: Solo tareas asignadas

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Implementar feature X",
    "description": "Descripción detallada",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "assignee": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@dllf.com"
    },
    "creator": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@dllf.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-05T00:00:00.000Z"
  }
]
```

#### GET /tasks/stats
Estadísticas de tareas

**Response:**
```json
{
  "pending": 5,
  "inProgress": 3,
  "completed": 12,
  "total": 20
}
```

#### GET /tasks/upcoming?days=7
Tareas próximas a vencer

**Query Params:**
- `days`: Número de días (default: 7)

#### GET /tasks/:id
Obtener tarea por ID

#### POST /tasks
Crear tarea (solo ADMIN)

**Request:**
```json
{
  "title": "Nueva tarea",
  "description": "Descripción",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2024-01-15T00:00:00.000Z",
  "assigneeId": "uuid",
  "devStartDate": "2024-01-10T00:00:00.000Z",
  "devEndDate": "2024-01-20T00:00:00.000Z",
  "testingStartDate": "2024-01-21T00:00:00.000Z"
}
```

#### PATCH /tasks/:id
Actualizar tarea
- ADMIN: Todos los campos
- DEVELOPER: Solo estado

**Request:**
```json
{
  "status": "COMPLETED"
}
```

#### DELETE /tasks/:id
Eliminar tarea (solo ADMIN)

---

### Calendario

#### GET /calendar
Listar eventos

**Query Params:**
- `startDate`: Fecha inicio (ISO string)
- `endDate`: Fecha fin (ISO string)

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Sprint Planning",
    "description": "Planificación del sprint",
    "startDate": "2024-01-15T09:00:00.000Z",
    "endDate": "2024-01-15T17:00:00.000Z",
    "eventType": "DEVELOPMENT",
    "isBlocked": false,
    "createdBy": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "User"
    }
  }
]
```

#### GET /calendar/type/:eventType
Filtrar eventos por tipo

**Tipos:** `DEVELOPMENT`, `DELIVERY`, `MILESTONE`, `BLOCKER`

#### GET /calendar/:id
Obtener evento por ID

#### POST /calendar
Crear evento (solo ADMIN)

**Request:**
```json
{
  "title": "Release v1.0",
  "description": "Lanzamiento de versión 1.0",
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-01T23:59:59.000Z",
  "eventType": "DELIVERY",
  "isBlocked": false
}
```

#### PATCH /calendar/:id
Actualizar evento (solo ADMIN)

#### DELETE /calendar/:id
Eliminar evento (solo ADMIN)

---

### Bitácora

#### GET /audit
Listar logs de auditoría (solo ADMIN)

**Query Params:**
- `skip`: Número de registros a saltar (default: 0)
- `take`: Número de registros a obtener (default: 100)

**Response:**
```json
[
  {
    "id": "uuid",
    "action": "CREATE_TASK",
    "entityType": "Task",
    "entityId": "uuid",
    "details": {
      "title": "Nueva tarea",
      "priority": "HIGH"
    },
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "user": {
      "id": "uuid",
      "email": "admin@dllf.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
]
```

#### GET /audit/entity/:entityType/:entityId
Logs de una entidad específica

#### GET /audit/user/:userId
Logs de un usuario específico

#### GET /audit/action/:action
Logs de una acción específica

**Acciones comunes:**
- `LOGIN`, `LOGOUT`
- `CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`
- `CREATE_USER`, `UPDATE_USER`, `DELETE_USER`
- `CREATE_CALENDAR_EVENT`, `UPDATE_CALENDAR_EVENT`, `DELETE_CALENDAR_EVENT`

---

## Códigos de Estado HTTP

- `200 OK`: Petición exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Error en la petición
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado (permisos insuficientes)
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: email duplicado)
- `500 Internal Server Error`: Error del servidor

## Manejo de Errores

Las respuestas de error siguen este formato:

```json
{
  "statusCode": 400,
  "message": "Mensaje de error descriptivo",
  "error": "Bad Request"
}
```

## Rate Limiting

Actualmente no implementado. Se recomienda agregar en producción.

## Paginación

Algunos endpoints soportan paginación con `skip` y `take`:

```
GET /audit?skip=0&take=50
```

