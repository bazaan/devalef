# Configuración de Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido:

```env
# Database - Ajusta según tu configuración de PostgreSQL
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/dllf_dashboard?schema=public"

# JWT - Cambia estos valores por secretos seguros en producción
JWT_SECRET="tu-super-secret-jwt-key-cambiar-en-produccion"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="tu-super-secret-refresh-key-cambiar-en-produccion"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:3000
```

## Pasos siguientes:

1. **Crear la base de datos PostgreSQL:**
   ```bash
   createdb dllf_dashboard
   # O usando psql:
   psql -U postgres
   CREATE DATABASE dllf_dashboard;
   ```

2. **Actualizar DATABASE_URL** en `.env` con tus credenciales reales

3. **Generar el cliente Prisma:**
   ```bash
   npx prisma generate
   ```

4. **Ejecutar migraciones:**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Iniciar el servidor:**
   ```bash
   npm run start:dev
   ```

