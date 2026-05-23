# Sistema de Gestión para Taller Automotriz - Monolito Next.js

Este proyecto consiste en una aplicación web monolítica diseñada para optimizar la gestión operativa de talleres mecánicos PYME.

Permite centralizar el control de clientes, vehículos y órdenes de trabajo, integrando comunicación en tiempo real mediante WebSockets.

---

## 1. Arquitectura del Sistema

El sistema se basa en una arquitectura de **Monolito Moderno** utilizando **Next.js**, **Prisma ORM** y **Socket.io**. 

---

## Diagrama de Bloques Estructurado
![Arquitectura Monolítica](public/EstructuraProyectoIBIM.png)

---

## Anatomía del Diagrama y Componentes

Para facilitar la comprensión del sistema, a continuación se detalla cómo se relacionan las capas lógicas de la imagen con la estructura física del código fuente:

### 1. Capa del Cliente (Frontend)
Responsable de la experiencia de usuario y la visualización de datos.
- **Ubicación en código:** `src/components/`, `src/app/**/page.tsx`
- **Tecnologías:** React, Tailwind CSS, **socket.io-client**.

### 2. Capa de Negocio (Servidor Monolítico)
El "cerebro" del sistema. Gestiona la seguridad, las reglas del taller y la comunicación en vivo.
- **Ubicación en código:** `src/services/`, `src/app/api/`, `src/middleware.ts`, **`server.js`**
- **Tecnologías:** Next.js API Routes, **Socket.io** (Servidor), Bcrypt.

### 3. Capa de Datos (Persistencia)
Encargada del almacenamiento y la integridad de la información.
- **Ubicación en código:** `prisma/`, `src/lib/prisma.ts`
- **Tecnologías:** PostgreSQL, Prisma ORM.

---

## 2. Tecnologías Clave

*   **Next.js (App Router):** Framework principal de React para el frontend y backend (API).
*   **Prisma ORM:** Capa de abstracción y gestión de base de datos PostgreSQL.
*   **Socket.io & Socket.io-client:** Motor de WebSockets (servidor y cliente) para el chat interactivo en tiempo real (HU-07).
*   **PostgreSQL:** Base de datos relacional para persistencia de datos.
*   **Bcrypt:** Algoritmo de hashing para la seguridad de contraseñas.
*   **Tailwind CSS:** Framework de diseño para una interfaz minimalista y empresarial.

---

## 3. Stack Tecnológico y Herramientas

| Categoría | Tecnología | Descripción |
|---|---|---|
| Framework Principal | **Next.js** | Framework principal del proyecto usando App Router. |
| Librería de Interfaz | **React** | Librería para construir interfaces de usuario dinámicas. |
| Lenguaje | **TypeScript** | Permite tipado estricto y ayuda a prevenir errores durante el desarrollo. |
| Base de Datos | **PostgreSQL** | Base de datos relacional para almacenar la información del sistema. |
| ORM | **Prisma 7** | Permite realizar consultas seguras a la base de datos. |
| Driver Adapter | **@prisma/adapter-pg** | Adaptador oficial para conectar Prisma con PostgreSQL. |
| Tiempo Real (Servidor) | **Socket.io** | Motor WebSocket para comunicación bidireccional (HU-07). |
| Tiempo Real (Cliente) | **socket.io-client** | Librería para conectar el navegador con el chat en vivo. |
| Estilos | **Tailwind CSS** | Framework de utilidades CSS para diseñar interfaces de forma rápida. |
| Seguridad | **Bcrypt** | Encriptación de contraseñas de un solo sentido. |
| Gestor de Paquetes | **pnpm** | Permite instalaciones rápidas y seguras. |

---

## 4. Instalación y Configuración

Siga estos pasos para levantar el proyecto localmente:

### Prerrequisitos
- Node.js (v18 o superior)
- pnpm instalado (`npm install -g pnpm`)
- Instancia de PostgreSQL activa.

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/jeyedu552/sistema-gestion-taller.git
    cd sistema-gestion-taller
    ```
2.  **Instalar dependencias (Incluye Socket.io):**
    ```bash
    pnpm install
    ```
3.  **Configurar variables de entorno:**
    Cree un archivo `.env` en la raíz basado en `.env.example` y configure su `DATABASE_URL`.
4.  **Sincronizar base de datos:**
    ```bash
    pnpm prisma migrate dev
    pnpm prisma generate
    ```
5.  **Poblar datos iniciales (Seed):**
    ```bash
    pnpm prisma db seed
    ```
6.  **Iniciar servidor de desarrollo (Soporta WebSockets):**
    ```bash
    pnpm dev
    ```

---
## 5. Definición de Roles y Seguridad

El sistema implementa un control de accesos basado en tres roles estrictos para garantizar la integridad operativa:

- **Administrador:** Acceso total (Usuarios, Vehículos, Órdenes y Liquidación).
- **Mecánico:** Terminal técnica (Gestión de órdenes asignadas, repuestos y chat).
- **Cliente:** Portal de seguimiento (Consulta de estado, historial y chat).

---

## 6. Flujo de Trabajo y Estándares de Git

Para coordinar los aportes de todo el equipo y asegurar un repositorio limpio, se adopta el modelo **Git Flow simplificado** combinado con la convención **Conventional Commits**.

### Formato de Commits (Estándar Profesional)
Cada confirmación de código debe iniciar con un prefijo en minúsculas seguido de dos puntos y la referencia a la Historia de Usuario correspondiente en el `scope`.

- **`feat(HU-XX):`** Nueva funcionalidad (ej: `feat(HU-07): integracion de socket io`).
- **`fix(HU-XX):`** Corrección de un fallo (ej: `fix(HU-01): error en login`).
- **`docs:`** Cambios exclusivos en la documentación.
- **`chore:`** Tareas de mantenimiento o instalación de dependencias.

---

## 7. Acceso al Sistema

Una vez levantado el servidor, puede acceder a la plataforma a través de los siguientes enlaces:

- **Portal de Acceso:** [http://localhost:3000/autenticacion/inicio-sesion](http://localhost:3000/autenticacion/inicio-sesion)
- **Registro Público:** [http://localhost:3000/autenticacion/registro](http://localhost:3000/autenticacion/registro)

*Nota: Para acceder a los paneles privados, utilice las credenciales generadas por el proceso de `seed` inicial.*
