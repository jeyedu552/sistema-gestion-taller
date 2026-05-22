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
| ORM | **Prisma 7** | Permite realizar consultas seguras a la base de datos (Requiere Driver Adapter). |
| Driver Adapter | **@prisma/adapter-pg** | Adaptador oficial para conectar Prisma con PostgreSQL. |
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
feature/inicio-sesion-autenticacion
```

---

### `fix/descripcion-error`

Ramas urgentes creadas para solucionar fallas detectadas en la rama de integración.

Ejemplo:

```txt
fix/error-validacion-inicio-sesion
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

## Vinculación con Historias de Usuario

Cada confirmación de código debe iniciar con un prefijo en minúsculas e incluir de forma obligatoria la referencia a la Historia de Usuario correspondiente en el `scope`.

## Ejemplos de commits

```bash
feat(HU-01): implementacion de encriptacion bcrypt en registro de usuarios
```

```bash
feat(HU-05): adicion de formulario dinámico de repuestos en el panel del mecanico
```

```bash
fix(HU-03): correccion en la expresion regular de validacion de placas
```

```bash
chore(deps): instalacion de dependencias de desarrollo para prisma ORM
```

```bash
docs(readme): actualizacion de la estructura de carpetas y guias locales
```

---

## 4. Estructura del Proyecto e Inyección de Capas

El proyecto sigue una arquitectura lógica por capas distribuida en la carpeta `src`. Al generar o modificar código, se deben respetar estrictamente estas responsabilidades:

```plaintext
/
├── prisma/                 # Configuración de Prisma ORM
│   └── schema.prisma       # Modelos y entidades de la Base de Datos Relacional
├── public/                 # Recursos y activos estáticos (imágenes, iconos, logos)
├── src/
│   ├── app/                # Capa de Enrutamiento y Controladores
│   │                       # Páginas, Endpoints (API Routes) y Server Actions.
│   ├── components/         # Capa de Presentación (UI)
│   │                       # Componentes visuales, botones y formularios (React + Tailwind).
│   ├── services/           # Capa de Lógica de Negocio
│   │                       # Cálculos de órdenes, validaciones pesadas y reglas del taller automotriz.
│   ├── lib/                # Capa de Acceso a Datos e Infraestructura
│   │                       # Instancia única de Prisma DB y clientes externos.
│   ├── types/              # Capa de Definiciones
│   │                       # Interfaces, tipos y esquemas globales de TypeScript.
│   └── middleware.ts       # Capa de Seguridad Global
│                           # Control de acceso, protección de rutas y validación de sesiones.
├── .env.example            # Plantilla pública de referencia para variables de entorno locales
├── .gitignore              # Archivos y credenciales estrictamente excluidos del repositorio
├── package.json            # Gestión de dependencias y scripts
└── pnpm-lock.yaml          # Historial de versiones gestionado por pnpm
```

---

# 6. Instrucciones de Levantamiento Local

Siga estos pasos en orden cronológico para inicializar el entorno de desarrollo en su computadora.

## 1. Clonar el repositorio y situarse en desarrollo

```bash
git clone <url-del-repositorio>
cd taller-automotriz
git checkout develop
```

## 2. Instalar dependencias con `pnpm`

```bash
pnpm install
```

## 3. Configurar el entorno local

Duplica el archivo de plantilla y configúralo con tus credenciales locales de base de datos:

```bash
cp .env.example .env
```

Abra el archivo `.env` resultante y modifique la propiedad `DATABASE_URL` con el usuario y contraseña de su PostgreSQL local.

## 4. Ejecutar migraciones de la base de datos

Este comando creará sus tablas locales en PostgreSQL y aplicará las relaciones jerárquicas:

```bash
pnpm dlx prisma migrate dev --name inicializacion_sistema
```

## 5. Ejecutar la semilla (Seed) de datos

Para inyectar al Administrador Maestro en su sistema, ejecute el siguiente comando:

```bash
pnpm dlx prisma db seed
```

## 6. Iniciar el servidor de desarrollo

```bash
pnpm dev
```

## 7. Abrir el proyecto e iniciar sesión

Abra la siguiente dirección en su navegador web:

```bash
http://localhost:3000
```

Para acceder al panel de administración completo, utilice las credenciales inyectadas por la semilla. semilla.