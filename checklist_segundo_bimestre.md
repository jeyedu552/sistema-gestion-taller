# ✅ Checklist Completo — Segundo Bimestre: Migración a Microservicios

**Proyecto:** Sistema de Gestión para Taller Automotriz
**Objetivo:** Ir de 0 a 100 de forma estructurada, cumpliendo cada punto de la rúbrica del instructor.

> **Cómo usar este documento:**
> Marca cada ítem con `[x]` una vez completado. Los bloques están ordenados por dependencia:
> nunca empieces un bloque si el anterior no está completado al 100%.

---

## BLOQUE 0 — Requisitos Previos (Antes de tocar código)

### Herramientas que deben estar instaladas en cada PC del equipo

- [ ] **Node.js v20 LTS** o superior → https://nodejs.org
- [ ] **pnpm** → `npm install -g pnpm`
- [ ] **Docker Desktop** (incluye Docker y Docker Compose) → https://www.docker.com/products/docker-desktop
- [ ] **Git** configurado con nombre y email del integrante
- [ ] **VS Code** (recomendado) con extensiones: Prisma, Docker, ESLint, TypeScript
- [ ] Cuenta en **Docker Hub** (gratuita, para el CD pipeline) → https://hub.docker.com
- [ ] Cuenta en **GitHub** con acceso al repositorio del grupo

### Verificación del entorno

```bash
node --version      # debe ser >= v20
pnpm --version      # debe ser >= v8
docker --version    # debe estar instalado
docker compose version  # debe estar instalado
git --version
```

---

## BLOQUE 1 — Preparación del Repositorio (Monorepo)

### 1.1 Reorganizar la estructura de carpetas

- [ ] Crear la carpeta `apps/` en la raíz del repositorio
- [ ] Mover el proyecto Next.js actual dentro de `apps/frontend/`
- [ ] Crear las siguientes carpetas vacías:
  - `apps/ms-auth/`
  - `apps/ms-operaciones/`
  - `apps/ms-chat/`
  - `apps/api-gateway/`
  - `packages/shared-types/`

**Estructura final esperada:**
```
sistema-gestion-taller/       ← raíz del monorepo
├── apps/
│   ├── frontend/             ← Next.js (cliente puro, sin /api)
│   ├── ms-auth/              ← Express + Prisma (db_usuarios)
│   ├── ms-operaciones/       ← Express + Prisma (db_operaciones)
│   ├── ms-chat/              ← Express + Socket.io (db_chat)
│   └── api-gateway/          ← Express (enruta y valida JWT)
├── packages/
│   └── shared-types/         ← Interfaces TypeScript compartidas
├── monitoring/
│   └── prometheus.yml
├── k8s/                      ← (opcional, para punto extra Kubernetes)
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
└── pnpm-workspace.yaml
```

### 1.2 Configurar el workspace de pnpm

- [ ] Editar (o crear) `pnpm-workspace.yaml` en la raíz:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] Crear `package.json` raíz con scripts globales:

```json
{
  "name": "taller-automotriz-monorepo",
  "private": true,
  "scripts": {
    "dev": "docker compose up --build",
    "lint": "pnpm -r lint",
    "build": "pnpm -r build"
  }
}
```

- [ ] Ejecutar `pnpm install` desde la raíz para que pnpm reconozca el workspace

---

## BLOQUE 2 — Paquete Compartido: `shared-types`

> Este paquete evita duplicar las interfaces TypeScript en cada microservicio.

### 2.1 Crear el paquete

- [ ] Crear `packages/shared-types/package.json`:

```json
{
  "name": "@taller/shared-types",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

- [ ] Crear `packages/shared-types/src/index.ts` con interfaces compartidas:

```typescript
// Roles del sistema
export type Role = 'ADMIN' | 'MECANICO' | 'CLIENTE';

// Payload que viaja dentro del JWT
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Estados de una orden de trabajo
export type OrderStatus =
  | 'PENDIENTE'
  | 'EN_PROGRESO'
  | 'LISTO_PARA_LIQUIDAR'
  | 'FINALIZADO';
```

---

## BLOQUE 3 — MS-Auth: Microservicio de Autenticación

### 3.1 Inicializar el proyecto Node.js

- [ ] Dentro de `apps/ms-auth/`, ejecutar `pnpm init`
- [ ] Instalar dependencias:

```bash
pnpm add express bcrypt jsonwebtoken @prisma/client @prisma/adapter-pg pg dotenv prom-client
pnpm add -D typescript @types/express @types/bcrypt @types/jsonwebtoken @types/node @types/pg ts-node prisma
```

- [ ] Crear `tsconfig.json` para el servicio

### 3.2 Configurar Prisma para `db_usuarios`

- [ ] Crear `apps/ms-auth/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL_AUTH")
}

enum Role {
  ADMIN
  MECANICO
  CLIENTE
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(CLIENTE)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}
```

- [ ] Crear archivo `.env` del servicio con `DATABASE_URL_AUTH`
- [ ] Ejecutar `pnpm prisma migrate dev --name init_usuarios`
- [ ] Crear script `seed.ts` para insertar los 3 usuarios de prueba (admin, mecanico, cliente) con contraseña `admin123`

### 3.3 Implementar los endpoints REST

- [ ] `POST /auth/register` → Registrar usuario (hash con bcrypt, salt 10)
- [ ] `POST /auth/login` → Validar credenciales y retornar JWT firmado
- [ ] `GET /auth/verify` → Validar un JWT recibido (lo usará el Gateway internamente)
- [ ] `GET /users` → Listar usuarios (solo ADMIN)
- [ ] `PUT /users/:id` → Actualizar usuario (solo ADMIN)
- [ ] `DELETE /users/:id` → Inactivar usuario (soft delete)
- [ ] `GET /health` → `{ status: "ok", service: "ms-auth" }`
- [ ] `GET /metrics` → Endpoint Prometheus con `prom-client`

### 3.4 Implementar el Patrón Repository (Patrón 1)

- [ ] Crear `apps/ms-auth/src/repositories/UserRepository.ts` → clase que encapsula todo acceso a Prisma
- [ ] El controlador (`AuthController.ts`) **solo llama al Repository**, nunca llama a Prisma directamente
- [ ] Documentar esto como el **Patrón Repository** en la presentación

### 3.5 Implementar generación de JWT

- [ ] Crear `apps/ms-auth/src/services/TokenService.ts`
- [ ] Función `sign(payload: JwtPayload): string` → genera token con `expiresIn: '8h'`
- [ ] Función `verify(token: string): JwtPayload` → decodifica y valida firma
- [ ] El secret del JWT debe estar en variable de entorno `JWT_SECRET`

---

## BLOQUE 4 — MS-Operaciones: Microservicio del Taller

### 4.1 Inicializar el proyecto

- [ ] Misma estructura que MS-Auth (pnpm init + dependencias Express + Prisma + prom-client)

### 4.2 Configurar Prisma para `db_operaciones`

- [ ] Crear `apps/ms-operaciones/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL_OPERACIONES")
}

model Vehicle {
  id        String      @id @default(cuid())
  plate     String      @unique
  brand     String
  model     String
  year      Int
  isActive  Boolean     @default(true)
  ownerId   String      // String, sin FK nativa (usuario en otra BD)
  createdAt DateTime    @default(now())
  orders    WorkOrder[]
}

enum OrderStatus {
  PENDIENTE
  EN_PROGRESO
  LISTO_PARA_LIQUIDAR
  FINALIZADO
}

model WorkOrder {
  id          String        @id @default(cuid())
  description String
  status      OrderStatus   @default(PENDIENTE)
  vehicleId   String
  vehicle     Vehicle       @relation(fields: [vehicleId], references: [id])
  mechanicId  String        // String, sin FK nativa (usuario en otra BD)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  items       ServiceItem[]
}

model ServiceItem {
  id          String    @id @default(cuid())
  description String
  price       Float
  workOrderId String
  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  createdAt   DateTime  @default(now())
}
```

- [ ] Ejecutar `pnpm prisma migrate dev --name init_operaciones`

### 4.3 Implementar endpoints REST (CRUD completo)

**Vehículos:**
- [ ] `POST /vehicles` → Crear vehículo
- [ ] `GET /vehicles` → Listar todos
- [ ] `GET /vehicles/:id` → Obtener por ID
- [ ] `PUT /vehicles/:id` → Actualizar
- [ ] `DELETE /vehicles/:id` → **Borrado físico** (cubre el Delete real del bimestre 1)

**Órdenes de Trabajo:**
- [ ] `POST /orders` → Crear orden
- [ ] `GET /orders` → Listar (con filtro por `mechanicId` si rol = MECANICO)
- [ ] `GET /orders/:id` → Obtener con ítems
- [ ] `PUT /orders/:id` → Actualizar estado
- [ ] `DELETE /orders/:id` → Eliminar orden

**Ítems de Servicio (Repuestos):**
- [ ] `POST /orders/:id/items` → Agregar repuesto
- [ ] `DELETE /orders/:id/items/:itemId` → Eliminar repuesto

**Liquidación:**
- [ ] `POST /orders/:id/finalize` → Calcular total y cambiar estado a FINALIZADO

**Endpoints comunes:**
- [ ] `GET /health`
- [ ] `GET /metrics`

### 4.4 Patrón Repository (también aplicado aquí)

- [ ] Crear `VehicleRepository.ts`, `OrderRepository.ts`, `ServiceItemRepository.ts`
- [ ] Todos los controladores consumen los repositories, nunca Prisma directamente

---

## BLOQUE 5 — MS-Chat: Microservicio de Chat

### 5.1 Inicializar el proyecto

- [ ] Instalar: `express socket.io @prisma/client pg dotenv prom-client @opentelemetry/sdk-node`

### 5.2 Configurar Prisma para `db_chat`

- [ ] Crear `apps/ms-chat/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL_CHAT")
}

model ChatMessage {
  id          String   @id @default(cuid())
  text        String
  workOrderId String   // referencia a WorkOrder (sin FK nativa)
  senderId    String   // referencia a User (sin FK nativa)
  senderName  String   // guardado localmente para no depender de MS-Auth en lectura
  createdAt   DateTime @default(now())
}
```

- [ ] Ejecutar `pnpm prisma migrate dev --name init_chat`

### 5.3 Implementar WebSockets con Socket.io

- [ ] Configurar servidor HTTP + Socket.io en el mismo proceso Express
- [ ] Evento `join-order` → el cliente se une al room de una orden específica
- [ ] Evento `send-message` → guarda en `db_chat` y emite a todos en el room
- [ ] Evento `load-history` → retorna el historial de mensajes de la orden
- [ ] Validar el JWT en el middleware de conexión de Socket.io

### 5.4 Endpoints REST

- [ ] `GET /messages/:workOrderId` → Historial de mensajes (para Admin en modo lectura)
- [ ] `GET /health`
- [ ] `GET /metrics`

---

## BLOQUE 6 — API Gateway (Patrón 2)

> Actúa como única puerta de entrada. Valida JWT y enruta las peticiones.
> Este es el **Patrón API Gateway**, el segundo patrón de diseño documentado.

### 6.1 Inicializar el proyecto

- [ ] Instalar: `express http-proxy-middleware jsonwebtoken dotenv`

### 6.2 Variables de entorno

```env
JWT_SECRET=mismo_secret_que_ms_auth
MS_AUTH_URL=http://ms-auth:3001
MS_OPERACIONES_URL=http://ms-operaciones:3002
MS_CHAT_URL=http://ms-chat:3003
PORT=8080
```

### 6.3 Middleware de autenticación JWT

- [ ] Crear `GatewayAuthMiddleware.ts`:
  - Leer el header `Authorization: Bearer <token>`
  - Verificar el JWT con `jwt.verify()`
  - Si es válido: inyectar `x-user-id`, `x-user-role`, `x-user-email` en los headers antes de reenviar
  - Si es inválido: responder `401 Unauthorized`

### 6.4 Configurar las rutas de enrutamiento

- [ ] `POST /api/auth/login` → Sin validar JWT (ruta pública) → MS-Auth
- [ ] `POST /api/auth/register` → Sin validar JWT (ruta pública) → MS-Auth
- [ ] `GET /api/auth/verify` → MS-Auth
- [ ] `/**users/**` → Validar JWT → MS-Auth
- [ ] `/**vehicles/**` → Validar JWT → MS-Operaciones
- [ ] `/**orders/**` → Validar JWT → MS-Operaciones
- [ ] `/**messages/**` → Validar JWT → MS-Chat
- [ ] `GET /health` → Estado de todos los servicios internos

---

## BLOQUE 7 — Frontend: Refactoring de Next.js

### 7.1 Limpiar el monolito

- [ ] **Eliminar** `src/app/api/` completa
- [ ] **Eliminar** `server.js` (Socket.io ahora vive en MS-Chat)
- [ ] **Eliminar** del `package.json`: `socket.io`, `prisma`, `@prisma/client`, `bcrypt`, `pg`
- [ ] **Mantener**: `socket.io-client`, `next`, `react`, `tailwindcss`, `typescript`

### 7.2 Crear capa de servicios del frontend

- [ ] `apps/frontend/src/lib/api.ts` → función base `fetchWithAuth(url, options)` que adjunta JWT
- [ ] `apps/frontend/src/services/authService.ts` → `login()`, `register()`, `logout()`
- [ ] `apps/frontend/src/services/vehicleService.ts` → CRUD de vehículos
- [ ] `apps/frontend/src/services/orderService.ts` → CRUD de órdenes y repuestos

### 7.3 Conectar el chat al MS-Chat

- [ ] Crear `apps/frontend/src/lib/socket.ts` → configura `socket.io-client` apuntando al Gateway
- [ ] Actualizar el componente de chat para usar este cliente Socket.io

### 7.4 Gestión de sesión JWT en el frontend

- [ ] Al hacer login exitoso, guardar el JWT en una cookie `httpOnly`
- [ ] En cada petición, leer el JWT y adjuntarlo en el header `Authorization: Bearer <token>`
- [ ] Implementar `middleware.ts` de Next.js para proteger rutas privadas leyendo la cookie
- [ ] Conectar "Olvidé mi contraseña" al endpoint de MS-Auth

### 7.5 Validaciones de formularios en pantalla (requisito de la rúbrica)

- [ ] **Login:** campos requeridos, formato de email válido
- [ ] **Registro:** campos requeridos, email válido, contraseña mínimo 6 caracteres
- [ ] **Vehículo:** placa alfanumérica, año solo números (entre 1900 y año actual), marca y modelo requeridos
- [ ] **Orden:** descripción requerida, mecánico requerido, vehículo requerido
- [ ] **Repuesto:** descripción requerida, precio solo números positivos (mayor que 0)
- [ ] **Chat:** mensaje no puede estar vacío ni tener solo espacios

---

## BLOQUE 8 — Dockerización Completa

### 8.1 Crear `Dockerfile` para cada servicio

- [ ] `apps/ms-auth/Dockerfile`
- [ ] `apps/ms-operaciones/Dockerfile`
- [ ] `apps/ms-chat/Dockerfile`
- [ ] `apps/api-gateway/Dockerfile`
- [ ] `apps/frontend/Dockerfile`

Todos siguen el patrón multi-stage build:
```dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### 8.2 Crear `docker-compose.yml` principal

- [ ] Definir la red interna `taller-network`
- [ ] Servicio `postgres` con las 3 bases de datos
- [ ] Servicio `ms-auth` (puerto 3001)
- [ ] Servicio `ms-operaciones` (puerto 3002)
- [ ] Servicio `ms-chat` (puerto 3003)
- [ ] Servicio `api-gateway` (puerto 8080)
- [ ] Servicio `frontend` (puerto 3000)
- [ ] Definir `depends_on` correctamente entre servicios
- [ ] Definir `volumes` para persistencia de PostgreSQL

### 8.3 Verificaciones de Docker

- [ ] `docker compose up --build` → todos los contenedores levantan sin errores
- [ ] `docker compose ps` → todos en estado `Up`
- [ ] Frontend carga en `http://localhost:3000`
- [ ] Gateway responde en `http://localhost:8080/health`
- [ ] `docker compose down` → limpia correctamente todos los contenedores

---

## BLOQUE 9 — Monitoreo: Prometheus + Grafana + Jaeger

### 9.1 Instrumentar los microservicios con `prom-client`

En cada microservicio Express:

- [ ] Instalar `prom-client`
- [ ] Crear `src/lib/metrics.ts` con métricas por defecto + contador HTTP
- [ ] Agregar ruta `GET /metrics` que retorna las métricas en formato Prometheus
- [ ] Verificar que `http://localhost:3001/metrics` responde correctamente

### 9.2 Configurar Prometheus

- [ ] Crear `monitoring/prometheus.yml` apuntando a los 4 servicios (`ms-auth`, `ms-operaciones`, `ms-chat`, `api-gateway`)
- [ ] Agregar servicio `prometheus` al `docker-compose.yml` (puerto 9090)
- [ ] Verificar que `http://localhost:9090` muestra los targets activos

### 9.3 Configurar Grafana

- [ ] Agregar servicio `grafana` al `docker-compose.yml` (puerto 3333)
- [ ] Acceder a `http://localhost:3333` (admin / admin123)
- [ ] Agregar fuente de datos Prometheus → `http://prometheus:9090`
- [ ] Importar dashboard de Node.js (ID `11159` en Grafana.com)
- [ ] Tomar capturas de pantalla del dashboard para la presentación

### 9.4 Configurar Jaeger (trazabilidad distribuida)

- [ ] Agregar servicio `jaeger` al `docker-compose.yml` (puerto UI: 16686)
- [ ] Instalar en cada microservicio: `@opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http`
- [ ] Crear `src/tracing.ts` en cada servicio e importarlo al inicio de `index.ts`
- [ ] Verificar que las trazas aparecen en `http://localhost:16686`

---

## BLOQUE 10 — Seguridad

### 10.1 JWT — Lista de verificación

- [ ] `JWT_SECRET` es idéntico en `ms-auth` y `api-gateway`
- [ ] El JWT incluye en su payload: `userId`, `email`, `role`
- [ ] El JWT expira en 8 horas
- [ ] El API Gateway rechaza peticiones sin token con `401 Unauthorized`
- [ ] Las rutas públicas (`/auth/login`, `/auth/register`) están excluidas de validación
- [ ] El token del frontend se guarda en cookie `httpOnly` (más seguro que localStorage)

### 10.2 OAuth 2.0 / OpenID Connect — Justificación para la presentación

- [ ] Preparar 1 diapositiva que explique:
  - **Se eligió JWT propio** porque el sistema gestiona identidades internas (no requiere login federado con Google, GitHub, etc.)
  - **OAuth 2.0 / OpenID Connect sería adecuado** si en el futuro se quiere que los clientes usen su cuenta Google para iniciar sesión, eliminando la gestión de contraseñas
  - La arquitectura actual **es compatible** con migrar a OAuth2: solo se reemplazaría `MS-Auth` por un Identity Provider como Auth0 o Keycloak, sin tocar los demás servicios

---

## BLOQUE 11 — DevOps: CI/CD con GitHub Actions

### 11.1 Crear el workflow

- [ ] Crear `.github/workflows/ci-cd.yml` con dos jobs:
  - **Job CI:** checkout → instalar pnpm → instalar deps → lint → build
  - **Job CD:** (solo en push a `main`) login Docker Hub → build + push de cada imagen

### 11.2 Configurar Secrets en GitHub

- [ ] Ir a GitHub → Settings → Secrets and variables → Actions
- [ ] Agregar `DOCKERHUB_USERNAME` → tu usuario de Docker Hub
- [ ] Agregar `DOCKERHUB_TOKEN` → token de acceso de Docker Hub (no la contraseña)

### 11.3 Verificación del pipeline

- [ ] Hacer un push a `main` y verificar que el pipeline se activa
- [ ] Verificar que el job de CI pasa (verde ✅)
- [ ] Verificar que las imágenes aparecen en Docker Hub tras el job de CD
- [ ] Tomar captura de pantalla del pipeline verde para la presentación

---

## BLOQUE 12 — (Extra) Kubernetes con Minikube

> Bloque opcional. Otorga puntos extra en la rúbrica.

### 12.1 Instalar Minikube

- [ ] Instalar Minikube → https://minikube.sigs.k8s.io/docs/start/
- [ ] Iniciar el clúster: `minikube start`
- [ ] Verificar: `kubectl get nodes`

### 12.2 Crear manifiestos de Kubernetes (carpeta `k8s/`)

Para cada servicio, crear `Deployment.yaml` + `Service.yaml`:

- [ ] `k8s/postgres/` → Deployment + Service + PersistentVolumeClaim
- [ ] `k8s/ms-auth/` → Deployment + Service (ClusterIP, puerto 3001)
- [ ] `k8s/ms-operaciones/` → Deployment + Service (ClusterIP, puerto 3002)
- [ ] `k8s/ms-chat/` → Deployment + Service (ClusterIP, puerto 3003)
- [ ] `k8s/api-gateway/` → Deployment + Service (LoadBalancer, puerto 8080)
- [ ] `k8s/frontend/` → Deployment + Service (LoadBalancer, puerto 3000)

### 12.3 Desplegar y verificar

```bash
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/ms-auth/
kubectl apply -f k8s/ms-operaciones/
kubectl apply -f k8s/ms-chat/
kubectl apply -f k8s/api-gateway/
kubectl apply -f k8s/frontend/
kubectl get pods   # todos deben estar en Running
minikube service api-gateway --url  # obtener URL pública
```

- [ ] Verificar que todos los pods están en estado `Running`
- [ ] Acceder al frontend desde la URL de Minikube

---

## BLOQUE 13 — Preparación de la Presentación

### 13.1 Diapositivas obligatorias

- [ ] **Slide 1 — Portada:** Nombre del proyecto, integrantes, bimestre
- [ ] **Slide 2 — Introducción / Planteamiento:** Problema que resuelve el sistema
- [ ] **Slide 3 — Arquitectura Anterior (Monolito):** Diagrama del primer bimestre
- [ ] **Slide 4 — Arquitectura Nueva (Microservicios):** Diagrama con los 5 componentes + BDs separadas + monitoreo + CI/CD
- [ ] **Slide 5 — Refactoring de Base de Datos:** Tabla comparativa antes/después. Explicar por qué se eliminaron las FK entre servicios (Database per Microservice)
- [ ] **Slide 6 — Patrones de Diseño:** Diagrama del **API Gateway** (patrón 1) + diagrama del **Repository Pattern** (patrón 2)
- [ ] **Slide 7 — Seguridad:** Diagrama del flujo JWT completo. Justificación de JWT vs OAuth 2.0
- [ ] **Slide 8 — Docker y Contenedores:** Diagrama del `docker-compose.yml`. Captura de `docker compose up` con todos los contenedores activos
- [ ] **Slide 9 — Monitoreo:** Capturas de Grafana (dashboards activos) y Jaeger (trazas de peticiones)
- [ ] **Slide 10 — CI/CD:** Captura del pipeline de GitHub Actions en verde ✅. Imágenes subidas a Docker Hub
- [ ] **Slide 11 — Conclusiones:** Qué aprendió cada integrante, desafíos encontrados

### 13.2 Demostración en vivo (orden sugerido)

1. Ejecutar `docker compose up --build` → mostrar que todos los contenedores levantan
2. Abrir `http://localhost:3000` → demostrar Login, Registro, Olvidé contraseña
3. Iniciar sesión como Admin → demostrar CRUD completo de Vehículos (Crear, Ver, Editar, Eliminar físico)
4. Iniciar sesión como Mecánico → demostrar gestión de órdenes y repuestos
5. Abrir el Chat → demostrar mensajería en tiempo real entre dos pestañas (Cliente y Mecánico)
6. Abrir `http://localhost:3333` → mostrar Grafana con métricas en vivo
7. Abrir `http://localhost:16686` → mostrar Jaeger con trazas de las peticiones recientes
8. Mostrar el pipeline de GitHub Actions en el repositorio público (verde ✅)
9. (Extra) Mostrar `kubectl get pods` si se implementó Kubernetes

---

## Tabla de Cobertura Final de la Rúbrica

| Punto de la Rúbrica | Bloque que lo cubre | Estado |
|---|---|---|
| Introducción / planteamiento | Bloque 13, Slide 2 | ⬜ Pendiente |
| Diagrama arquitectura anterior | Bloque 13, Slide 3 | ⬜ Pendiente |
| Diagrama arquitectura nueva con microservicios | Bloque 13, Slide 4 | ⬜ Pendiente |
| Refactoring de BD (Database per Microservice) | Bloques 3, 4, 5 + Slide 5 | ⬜ Pendiente |
| 2 patrones de diseño (API Gateway + Repository) | Bloques 4, 6 + Slide 6 | ⬜ Pendiente |
| Seguridad JWT (+ justificación OAuth 2.0) | Bloques 3, 6, 10 + Slide 7 | ⬜ Pendiente |
| Frontend funcional en contenedor | Bloques 7, 8 | ⬜ Pendiente |
| Backend funcional en contenedores | Bloques 3, 4, 5, 6, 8 | ⬜ Pendiente |
| Monitoreo y logs (Prometheus + Grafana + Jaeger) | Bloque 9 + Slide 9 | ⬜ Pendiente |
| DevOps CI/CD (GitHub Actions + Docker Hub) | Bloque 11 + Slide 10 | ⬜ Pendiente |
| Validaciones de datos en pantalla | Bloque 7.5 | ⬜ Pendiente |
| Navegabilidad entre pantallas | Bloque 7 (middleware Next.js) | ⬜ Pendiente |
| Demostración de ejecución exitosa | Bloque 13.2 | ⬜ Pendiente |
| **Kubernetes (Punto extra opcional)** | Bloque 12 | ⬜ Opcional |

---

*Documento de planificación generado para el proyecto `sistema-gestion-taller` — Segundo Bimestre.*
