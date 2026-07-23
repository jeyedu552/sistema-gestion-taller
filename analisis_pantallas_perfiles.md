# Análisis de Funcionamiento: Sistema de Gestión de Taller

A continuación se detalla el funcionamiento de las pantallas y componentes para cada uno de los tres perfiles del sistema (Administrador, Mecánico y Cliente) basándonos en el código actual de la rama `develop`.

---

## 1. Perfil Administrador (Admin)

El perfil de Administrador cuenta con un **Layout Principal** (barra lateral y superior) que envuelve a todas sus pantallas. 
*   **Barra Superior (Topbar):** Contiene un buscador global que al escribir y presionar `Enter` (o enviar el formulario) redirige a la tabla correspondiente (usuarios, vehículos u órdenes) aplicando un filtro de búsqueda. Su botón de "X" limpia la búsqueda. También incluye un ícono de notificaciones (visual por ahora) y el indicador del perfil.
*   **Barra Lateral (Sidebar):** Contiene los enlaces de navegación y el botón de **Cerrar Sesión**, el cual hace una petición a la API para destruir la sesión y redirige al inicio de sesión.

### Pantallas del Administrador:

#### A. Dashboard (`/administrador`)
*   **Funcionalidad:** Es la vista de bienvenida. Presenta tarjetas de Indicadores Clave (KPIs) como Órdenes Activas, Ingresos, Mecánicos Disponibles y Alertas de Inventario. También muestra una tabla resumida de las "Órdenes de Servicio Recientes".
*   **Botones:** 
    *   **"Registrar Cliente" y "Nueva Orden":** Botones de acción rápida en la cabecera (actualmente como diseño visual/mock en esta versión).
    *   **"Ver todas":** Enlace encima de la tabla que redirige a la pantalla completa de órdenes.
    *   **"Ver detalle" (ícono de ojo):** En cada fila de la tabla, proyectados para visualizar información rápida de la orden (visual/mock).

#### B. Órdenes de Servicio (`/administrador/ordenes`)
*   **Funcionalidad:** Muestra el historial y estado operativo de las reparaciones. Se nutre de la API en tiempo real (con recargas cada 15 segundos). Posee una tabla paginada.
*   **Botones y Acciones:**
    *   **"NUEVA ORDEN":** Despliega un modal que permite seleccionar un vehículo, un mecánico y redactar el diagnóstico inicial. Al darle a **"Abrir Orden"**, envía la información (POST) a la base de datos.
    *   **"Editar Descripción" (ícono lápiz):** Abre el mismo modal en modo edición para corregir el texto del fallo (PATCH). Botón **"Guardar Cambios"** para confirmar.
    *   **"Confirmar Pago y Liquidar" (ícono billetes):** Aparece solo en órdenes con estado `LISTO_PARA_LIQUIDAR`. Al pulsarlo, lanza una alerta de confirmación y, de aceptarse, cambia la orden a estado `FINALIZADO` bloqueándola para futuras ediciones.
    *   **"Auditar Chat" (ícono foro):** Abre un modal flotante con la conversación entre el mecánico y el cliente. Para el administrador este chat es de *solo lectura* (supervisión).
    *   **Paginación (Números):** Cambian la página de los registros mostrados en la tabla.

#### C. Usuarios (`/administrador/usuarios`)
*   **Funcionalidad:** Actúa como un directorio para la gestión de clientes y mecánicos. 
*   **Botones y Acciones:**
    *   **"NUEVO USUARIO":** Abre un modal pidiendo Nombre, Email, Contraseña temporal y Rol (Mecánico o Cliente). Al pulsar **"Crear Usuario"** hace un POST a la API.
    *   **Filtro de Roles (Select):** Menú desplegable que filtra la tabla dinámicamente mostrando "Todos", solo "Mecánicos" o solo "Clientes".
    *   **"Desactivar" / "Activar":** Botón ubicado en cada fila de usuario (excepto en otros admins). Envía un PATCH a la API para inhabilitar o habilitar el acceso del usuario al sistema.
    *   **Paginación (<, >, Números):** Navegación entre las páginas de resultados.

#### D. Vehículos (`/administrador/vehiculos`)
*   **Funcionalidad:** Inventario de vehículos vinculados a los clientes. 
*   **Botones y Acciones:**
    *   **"REGISTRAR VEHÍCULO":** Abre un modal para ingresar Placa, Año, Marca, Modelo y seleccionar un Cliente dueño. El botón **"Registrar Auto"** guarda los datos en la API.
    *   **"Editar Vehículo" (ícono lápiz):** Abre el modal con los datos cargados (el dueño se bloquea y no se puede editar). El botón **"Guardar Cambios"** actualiza el vehículo.
    *   **"Dar de Baja" / "Reactivar" (papeleras):** Pide confirmación en pantalla y, si se aprueba, cambia el estado de actividad del auto (útil si el cliente vende el auto o ya no asiste al taller).

#### E. Mecánicos, Inventario, Reportes y Configuración
*   **Estado actual:** En la rama `develop`, estas pantallas están listadas visualmente en el menú de navegación (sidebar) pero **aún no cuentan con páginas implementadas**. Su funcionalidad es netamente estructural por ahora.

---

## 2. Perfil Mecánico (`/mecanico`)

El Mecánico tiene un entorno enfocado a la operatividad. Su **Layout** incluye un buscador superior (para filtrar órdenes por placa o diagnóstico) y el botón de **Cerrar Sesión**.

### Dashboard "Mis Órdenes"
*   **Funcionalidad:** Muestra un panel con formato de "tarjetas" (cards) de todas las órdenes de servicio que tiene asignadas. Escucha eventos por WebSockets para notificar mensajes de chat nuevos mediante un globo rojo saltarín.
*   **Botones y Acciones:**
    *   **Tarjeta de Orden (Clic):** Al hacer clic en cualquier parte de una tarjeta, se abre el **Modal de Detalle** de esa orden y se limpian las notificaciones no leídas de la misma.
    *   **Dentro del Modal de Detalle:**
        *   **Botones de Estado ("PENDIENTE", "EN TALLER", "LISTO"):** Tres botones superiores. Al hacer clic en uno, se envía una petición PATCH para actualizar el estado del vehículo, notificando al sistema. Si la orden está "FINALIZADA", estos botones se bloquean.
        *   **Botón "AÑADIR" (Insumos):** Acompaña a un mini-formulario de repuestos. Al rellenar descripción y precio, presionar este botón hace un POST a la API sumando el repuesto a la tabla inferior y actualizando el subtotal acumulado de la reparación.
        *   **Chat de Comunicación:** En la parte derecha del modal, tiene la interfaz funcional de chat para hablar en tiempo real con el cliente.
        *   **Cerrar (X):** Cierra el modal y vuelve a la vista de tarjetas.

---

## 3. Perfil Cliente (`/cliente`)

El Cliente cuenta con un portal simplificado. Su **Layout** es una barra superior limpia donde se muestra su nombre y el botón de **Salir (Cerrar Sesión)**.

### Dashboard "Mi Garaje Virtual"
*   **Funcionalidad:** Una sola pantalla dividida en paneles. Muestra los KPIs (Autos registrados, En reparación, Listos para retirar), una lista de los vehículos de su propiedad y un historial de las reparaciones/órdenes. También escucha por WebSockets las alertas de chat del mecánico.
*   **Botones y Acciones:**
    *   **Fila del "Historial de Servicios" (Clic):** Al igual que el mecánico, hacer clic en una orden del historial abre el **Modal de Detalle del Servicio** y elimina la burbuja de notificación roja si hubiese mensajes nuevos.
    *   **Dentro del Modal de Detalle:**
        *   El cliente puede visualizar de forma pasiva toda la información (estado actual, mecánico asignado, diagnóstico e insumos aplicados y el total a pagar). *No tiene botones para editar datos.*
        *   **Chat con Mecánico:** Panel integrado en el lado derecho para comunicarse en directo, hacer preguntas o aprobar arreglos.
        *   **Cerrar (X):** Botón superior para cerrar el modal y regresar a su garaje.
