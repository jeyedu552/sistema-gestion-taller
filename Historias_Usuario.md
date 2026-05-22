# Historias de Usuario - Sistema de Gestión para Taller Automotriz

## HU-01 - Autenticación y control de acceso por roles

### Historia de Usuario

Como **usuario registrado**,  
quiero iniciar sesión con mi correo electrónico y contraseña,  
para acceder únicamente al panel correspondiente a mi rol dentro del sistema.

### Criterios de Aceptación

- El sistema debe permitir el inicio de sesión mediante correo electrónico y contraseña.
- El sistema debe validar las credenciales ingresadas antes de permitir el acceso.
- La ruta del usuario con rol **ADMIN** debe redirigir al panel `/administrador`.
- La ruta del usuario con rol **MECANICO** debe redirigir al panel `/mecanico`.
- La ruta del usuario con rol **CLIENTE** debe redirigir al panel `/cliente`.
- El sistema debe redirigir al login cualquier intento de acceso no autenticado a rutas protegidas.
- El sistema debe bloquear el acceso si un usuario autenticado intenta ingresar a una ruta que no corresponde a su rol.

### Reglas Técnicas

- Las contraseñas se almacenarán usando hashing unidireccional con bcrypt.
- El factor de costo mínimo para el algoritmo será `10`.
- Las rutas protegidas se validarán desde el servidor o mediante un middleware en Next.js.
- Las peticiones no autorizadas responderán con los códigos HTTP `401 No autorizado` o `403 Prohibido`.

---

## HU-02 - Gestión de usuarios del sistema

### Historia de Usuario

Como **Dueño del Taller**,  
quiero registrar, consultar, actualizar e inactivar usuarios,  
para mantener el control sobre el directorio de mis clientes y mi personal técnico.

### Criterios de Aceptación

- El administrador debe registrar nuevos usuarios asignando el rol **CLIENTE** o **MECANICO**.
- El administrador debe listar todos los usuarios registrados en el sistema.
- El administrador debe actualizar la información de clientes y mecánicos.
- El administrador debe inactivar usuarios para revocar su acceso operativo al sistema.
- El sistema debe bloquear el registro de dos usuarios con el mismo correo electrónico.
- El sistema debe mostrar un mensaje amigable si se detecta un correo duplicado.

### Reglas Técnicas

- El campo `email` estará definido como atributo `@unique` en la base de datos.
- La creación de usuarios con rol **MECANICO** será exclusiva del panel del administrador.
- El formulario público de registro creará por defecto usuarios con rol **CLIENTE**.
- El backend ignorará estrictamente cualquier intento de inyectar o manipular el rol desde el frontend público.

---

## HU-03 - Registro y vinculación de vehículos

### Historia de Usuario

Como **Dueño del Taller**,  
quiero registrar vehículos y asociarlos a un cliente,  
para mantener la trazabilidad exacta de a quién le pertenece cada automóvil.

### Criterios de Aceptación

- El administrador debe registrar la placa, marca, modelo y año del vehículo.
- El sistema debe asociar obligatoriamente el vehículo a un cliente previamente registrado.
- El sistema debe bloquear el registro de placas duplicadas.
- El formulario debe validar el formato alfanumérico de la placa.
- El sistema debe mostrar alertas claras ante formatos inválidos o placas existentes.

### Reglas Técnicas

- Los campos requeridos para la persistencia son: `placa`, `marca`, `modelo`, `año` y `ownerId`.
- El campo `placa` funcionará como un identificador `@unique`.
- El campo `ownerId` operará como llave foránea conectando con la tabla de usuarios.
- La validación del formato de la placa se ejecutará en ambas capas: frontend y backend.

---

## HU-04 - Creación y asignación de órdenes de trabajo

### Historia de Usuario

Como **Dueño del Taller**,  
quiero abrir órdenes de trabajo sobre un vehículo y asignarlas a un mecánico,  
para dar inicio formal al proceso de reparación.

### Criterios de Aceptación

- El administrador debe crear la orden seleccionando un vehículo del catálogo.
- El administrador debe asignar un mecánico específico a la orden.
- El administrador debe ingresar la descripción inicial del problema reportado.
- El sistema debe inicializar la orden nueva bajo el estado **PENDIENTE**.
- El sistema debe registrar de forma automática la marca de tiempo de creación.

### Reglas Técnicas

- La API requerirá de forma estricta los campos `description`, `vehicleId` y `mechanicId`.
- El estado inicial será controlado mediante un valor `enum`.
- La fecha de creación se inyectará utilizando la función `@default(now())` de Prisma.
- La base de datos rechazará la creación si las llaves foráneas del vehículo o mecánico no existen.

---

## HU-05 - Gestión técnica de la reparación

### Historia de Usuario

Como **Mecánico**,  
quiero visualizar mis órdenes asignadas, actualizar su estado y añadir los repuestos utilizados,  
para documentar mi avance operativo y los costos directos de la reparación.

### Criterios de Aceptación

- El mecánico debe visualizar exclusivamente el listado de sus propias órdenes.
- El mecánico debe tener restringido el acceso a las órdenes de sus compañeros.
- El mecánico debe transicionar el estado de la orden a **EN_PROGRESO** al iniciar la labor.
- El mecánico debe transicionar el estado a **LISTO_PARA_LIQUIDAR** al concluir el trabajo.
- El mecánico debe registrar de forma individual los repuestos y la mano de obra utilizada.
- El mecánico debe ingresar una descripción y el costo unitario por cada ítem añadido.

### Reglas Técnicas

- La consulta SQL/Prisma filtrará los registros validando que `mechanicId == currentUser.id`.
- Los ítems de costo se insertarán como nuevos registros en la tabla relacionada `ServiceItem`.
- El backend rechazará cualquier operación de mutación `PUT`, `POST` o `DELETE` si la orden tiene el estado **FINALIZADO**.

---

## HU-06 - Portal de seguimiento del cliente

### Historia de Usuario

Como **Cliente**,  
quiero observar mis automóviles y el estado de mis órdenes en tiempo real,  
para evitar tener que llamar o acudir físicamente al taller para pedir información.

### Criterios de Aceptación

- El cliente debe visualizar un panel con los vehículos que le pertenecen.
- El cliente debe consultar las órdenes de trabajo activas e históricas de sus autos.
- El cliente debe observar el estado actual de cada orden de forma clara.
- El cliente debe interactuar con una interfaz estrictamente informativa, sin opciones de edición.

### Reglas Técnicas

- La consulta relacional filtrará los datos asegurando que `ownerId == currentUser.id`.
- Los estados enumerados se mapearán visualmente utilizando paletas de colores mediante clases de Tailwind CSS.
- Las rutas de la API bloqueadas por rol rechazarán cualquier intento de inserción o actualización proveniente de un token de **CLIENTE**.

---

## HU-07 - Comunicación interactiva por orden de trabajo

### Historia de Usuario

Como **usuario involucrado directamente en la reparación**,  
quiero enviar y recibir mensajes instantáneos dentro de la orden,  
para resolver dudas técnicas y aprobar presupuestos de manera directa.

### Criterios de Aceptación

- El sistema debe habilitar un canal de mensajería bidireccional específico por cada orden de trabajo.
- La comunicación debe ser exclusiva entre el mecánico asignado y el cliente dueño del vehículo.
- El sistema debe entregar los mensajes a los receptores en tiempo real sin recargar la página.
- El sistema debe cargar el historial completo de la conversación ordenado cronológicamente al abrir el chat.

### Reglas Técnicas

- El canal bidireccional se establecerá implementando WebSockets con Socket.io.
- Cada emisión guardará un registro en la tabla `ChatMessage` vinculado al `workOrderId` y al `senderId`.
- El backend validará la conexión según el rol del usuario autenticado:
  - **CLIENTE:** puede conectar y emitir si su ID coincide con el `ownerId`.
  - **MECANICO:** puede conectar y emitir si su ID coincide con el `mechanicId`.

---

## HU-08 - Liquidación y cierre financiero

### Historia de Usuario

Como **Dueño del Taller**,  
quiero totalizar los costos de los repuestos de una orden completada y ejecutar su cierre,  
para proceder con la facturación y el cobro al cliente.

### Criterios de Aceptación

- El administrador debe revisar el desglose detallado de repuestos y servicios del mecánico.
- El sistema debe calcular el valor total a pagar de forma automática.
- El administrador debe ejecutar la confirmación del pago.
- El sistema debe transicionar la orden al estado definitivo **FINALIZADO**.
- El sistema debe bloquear la orden para evitar alteraciones financieras posteriores al cobro.

### Reglas Técnicas

- La lógica de negocio del backend aplicará una función de agregación `sum` sobre el campo `precio` de todos los `ServiceItem` vinculados.
- La responsabilidad del cálculo recaerá en el servidor, ignorando cualquier total enviado desde el cliente por seguridad.
- El estado **FINALIZADO** actuará como un candado en la API, rechazando intentos de modificación de diagnóstico, inyección de repuestos o cambio de costos.

---

## HU-09 - Auditoría de comunicaciones

### Historia de Usuario

Como **Dueño del Taller**,  
quiero tener acceso de lectura al historial de mensajes de cualquier orden de trabajo,  
para auditar la calidad de atención brindada por los mecánicos y supervisar los acuerdos con el cliente.

### Criterios de Aceptación

- El administrador debe poder ingresar a la vista de chat de cualquier orden de trabajo registrada en el sistema.
- La interfaz debe mostrar el historial completo de la conversación entre el mecánico y el cliente.
- La vista para el administrador debe ser estrictamente en modo solo lectura.
- La vista de auditoría no debe mostrar cajas de texto ni botones de envío.
- El administrador no debe participar de la conexión en tiempo real, solo revisar el registro histórico.

### Reglas Técnicas

- La interfaz del administrador no inicializará ninguna conexión con Socket.io.
- Los datos se obtendrán mediante una petición `GET` estándar a la API REST `/api/orders/[id]/messages`.
- El backend rechazará cualquier petición de inserción de mensajes `POST` si el token pertenece a un rol **ADMIN**.