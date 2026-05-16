# Sistema de Gestión para Taller Automotriz - Monolito Next.js

Este proyecto consiste en una aplicación web monolítica diseñada para optimizar la gestión operativa de talleres mecánicos PYME.

Permite centralizar el control de clientes, vehículos y órdenes de trabajo, integrando comunicación en tiempo real mediante WebSockets.

---

## 1. Arquitectura del Sistema

El sistema se basa en una arquitectura de **Monolito Moderno** utilizando **Next.js**, **Prisma ORM** y **Socket.io**.

Toda la lógica de presentación, negocio y persistencia conviven en el mismo entorno de ejecución.

---

## Diagrama de Bloques Estructurado
![Arquitectura Monolítica](./public/EstructuraProyectoIBIM.png).

---

## Anatomía del Diagrama y Componentes

### Capa del Cliente

**Navegador Web**

Interfaces construidas en **React**, tales como:

- Formularios de ingreso.
- Dashboard CRUD.
- Chat general.

El cliente mantiene peticiones HTTP tradicionales para la gestión de datos y una conexión abierta de WebSocket únicamente en la pantalla de chat.

---

### Servidor Monolítico

**Next.js + Node.js**

Reúne todos los componentes en una sola unidad de despliegue.

Sus responsabilidades principales son:

- Manejar **Server-Side Rendering (SSR)** para pre-renderizar vistas con datos directamente desde el servidor.
- Exponer **API Routes** que actúan como controladores de negocio.
- Proteger procesos críticos como la encriptación de contraseñas mediante **bcrypt**.
- Levantar el servidor de **Socket.io** sobre el mismo entorno para coordinar eventos en tiempo real.

---

### Capa de Persistencia

**Base de Datos Relacional**

Base de datos robusta encargada de organizar la información en tablas conectadas, tales como:

- `Users`
- `Vehicles`
- `WorkOrders`
- `ChatMessages`

**Prisma ORM** funciona como el puente exclusivo de comunicación entre la aplicación y la base de datos, garantizando:

- Tipado seguro.
- Consultas estructuradas.
- Protección frente a inyecciones SQL.

---
## 2. Stack Tecnológico y Herramientas

Para cumplir con los requerimientos técnicos y mantener un alto estándar de rendimiento, el proyecto utiliza las siguientes tecnologías:

| Categoría | Tecnología | Descripción |
|---|---|---|
| Framework Principal | **Next.js** | Framework principal del proyecto usando App Router. |
| Librería de Interfaz | **React** | Librería para construir interfaces de usuario dinámicas. |
| Lenguaje | **TypeScript** | Permite tipado estricto y ayuda a prevenir errores durante el desarrollo. |
| Base de Datos | **PostgreSQL / MySQL** | Base de datos relacional para almacenar la información del sistema. |
| ORM | **Prisma** | Permite realizar consultas seguras a la base de datos. |
| Tiempo Real | **Socket.io** | Comunicación bidireccional mediante WebSockets. |
| Estilos | **Tailwind CSS** | Framework de utilidades CSS para diseñar interfaces de forma rápida. |
| Seguridad | **Bcrypt** | Encriptación de contraseñas de un solo sentido. |
| Gestor de Paquetes | **pnpm** | Permite instalaciones rápidas, seguras y evita dependencias fantasma. |

---
## 3. Definición de Roles y Seguridad

Para mitigar riesgos de escalada de privilegios y mantener un alcance realista y eficiente, el sistema implementa un control de accesos basado en dos roles estrictos.

---

### Administrador / Taller

**Mecánico o Jefe de Taller**

Tiene acceso completo a las operaciones CRUD sobre:

- Clientes.
- Vehículos.
- Órdenes de trabajo.

Además, dispone de un formulario privado interno para dar de alta a nuevos trabajadores del taller.

---

### Cliente

**Dueño del vehículo**

Tiene permisos exclusivos de lectura sobre:

- Sus datos personales.
- Sus vehículos.
- El estado de sus órdenes de trabajo.

También cuenta con acceso bidireccional al chat en tiempo real para consultar avances de su orden de trabajo.

---

## Flujo Seguro de Enrolamiento

### Registro Público

**SignUp**

Diseñado exclusivamente para clientes externos.

El backend ignora cualquier parámetro de rol enviado por el frontend y fuerza el registro con el rol:

```txt
CLIENTE
```

Esto evita que un usuario malintencionado pueda modificar el rol desde el navegador o mediante una petición alterada.

---

### Registro de Personal

No existe un formulario público para mecánicos.

El administrador maestro debe registrar al personal desde una sección interna de la aplicación.

Durante este proceso, puede asignar:

- Una contraseña temporal.
- El rol de gestión correspondiente.

---

## 3. Flujo de Trabajo y Estándares de Git

Para coordinar los aportes de todo el equipo y asegurar un repositorio limpio, se adopta el modelo **Git Flow simplificado** combinado con la convención **Conventional Commits**.

---

## Estructura de Ramas

### `main`

Rama de producción.

Contiene únicamente código completamente estable y listo para despliegue.

---

### `develop`

Rama de integración.

Funciona como el eje central de consolidación del proyecto.

Aquí se mezclan las ramas de funcionalidades previamente validadas.

---

### `feature/nombre-tarea`

Ramas de desarrollo temporal extraídas desde `develop`.

Se utilizan para programar una tarea específica.

Ejemplo:

```txt
feature/login-auth
```

---

### `fix/descripcion-error`

Ramas urgentes creadas para solucionar fallas detectadas en la rama de integración.

Ejemplo:

```txt
fix/error-validacion-login
```

---

## Formato de Commits

**Estándar Profesional**

Cada confirmación de código debe iniciar con un prefijo en minúsculas seguido de dos puntos.

---

### `feat`

Se usa para una nueva funcionalidad.

Ejemplo:

```txt
feat: integracion de socket io en servidor
```

---

### `fix`

Se usa para la corrección de un fallo.

Ejemplo:

```txt
fix: validacion de correo vacio en signup
```

---

### `docs`

Se usa para cambios estrictos en la documentación.

Ejemplo:

```txt
docs: actualizacion de variables en readme
```

---

### `chore`

Se usa para tareas de mantenimiento, configuración o herramientas.

Ejemplo:

```txt
chore: instalacion de dependencia bcrypt
```

---

### `refactor`

Se usa para modificaciones de código que no alteran el comportamiento externo del sistema.

Ejemplo:

```txt
refactor: reorganizacion de servicios de ordenes de trabajo
```

## 4. Estructura del Proyecto

Esta es la organización del código fuente adoptada por el equipo para garantizar modularidad y escalabilidad:

```plaintext
/
├── prisma/                 # Configuración de Prisma ORM
│   └── schema.prisma       # Modelos y entidades de la Base de Datos Relacional
├── public/                 # Recursos y activos estáticos (imágenes, iconos, logos)
├── src/
│   ├── app/                # Enrutamiento basado en archivos (App Router de Next.js)
│   │   ├── (auth)/         # Páginas públicas de Autenticación (SignIn, SignUp, Reset)
│   │   ├── admin/          # Panel privado del taller (CRUD de vehículos, órdenes y personal)
│   │   ├── client/         # Panel del cliente (Consulta de vehículos, estado y chat)
│   │   ├── api/            # Backend: Controladores y endpoints HTTP del Monolito
│   │   │   ├── auth/       # API para gestión de registros internos y sesiones
│   │   │   ├── orders/     # API para operaciones CRUD de las órdenes de trabajo
│   │   │   └── chat/       # API para almacenar e invocar el historial de mensajes
│   │   ├── layout.tsx      # Estructura y envoltura global del sitio
│   │   └── page.tsx        # Pantalla de inicio o pasarela de acceso
│   ├── components/         # Componentes visuales de React reutilizables
│   │                       # Botones, Tablas, Modales, etc.
│   ├── lib/                # Inicializaciones maestras e instancias
│   │                       # PrismaClient, Config Socket.io, etc.
│   ├── services/           # Capa lógica aislada para consumo de APIs internas
│   └── types/              # Definiciones, tipos e interfaces globales de TypeScript
├── .env.example            # Plantilla pública de referencia para variables de entorno locales
├── .gitignore              # Archivos y credenciales estrictamente excluidos del repositorio
├── package.json            # Gestión de dependencias, metadatos y scripts de arranque del sistema
└── pnpm-lock.yaml          # Historial estricto y bloqueado de versiones gestionado por pnpm
```

---

## 5. Instrucciones de Levantamiento Local

Para ejecutar este proyecto en tu entorno local, sigue los siguientes pasos:

---

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd taller-automotriz
```

---

### 2. Instalar dependencias con pnpm

```bash
pnpm install
```

---

### 3. Configurar el entorno

Duplica el archivo de plantilla y configúralo con tus credenciales de base de datos locales:

```bash
cp .env.example .env
```

Luego edita el archivo `.env` con los datos correspondientes de tu base de datos.

Ejemplo:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taller_automotriz"
```

---

### 4. Ejecutar migraciones de la base de datos

```bash
pnpm dlx prisma migrate dev
```

Este comando aplica las migraciones definidas en Prisma y prepara la estructura de la base de datos.

---

### 6. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

---

### 6. Abrir el proyecto en el navegador
Una vez iniciado el servidor, abre el navegador y entra a:

```txt
http://localhost:3000