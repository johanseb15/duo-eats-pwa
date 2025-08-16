# Historias de Usuario Clave - PWA Duo Eats

Este documento define los flujos principales para probar la aplicación desde la perspectiva de los roles clave: Cliente, Administrador y Repartidor.

---

### Persona 1: Ana, la Cliente
**Objetivo:** Pedir comida de forma rápida, personalizada y con seguimiento claro.

#### HU-01: Realizar un Pedido Personalizado
**Como** Ana, **quiero** poder añadir una hamburguesa al carrito, personalizarla quitando un ingrediente, agregar una nota especial, pagar con QR y seguir mi pedido en tiempo real, **para** tener una experiencia de compra completa y satisfactoria.

- **Checklist de Prueba:**
  - [ ] Puedo añadir un producto al carrito.
  - [ ] Puedo abrir el carrito y modificar la cantidad de un producto.
  - [ ] Puedo añadir una nota como "Sin cebolla, por favor".
  - [ ] El carrito persiste si recargo la página.
  - [ ] En el checkout, puedo seleccionar mi dirección guardada (o añadir una nueva con geolocalización).
  - [ ] Puedo seleccionar un método de pago (ej. "Mercado Pago QR").
  - [ ] Tras confirmar, soy redirigido a una página de seguimiento (`/order/[id]`).
  - [ ] La página de seguimiento me muestra el estado "Pendiente".
  - [ ] Recibo una notificación push cuando el estado del pedido cambia.

---

### Persona 2: Laura, la Administradora del Local
**Objetivo:** Gestionar eficientemente los pedidos entrantes y los repartidores.

#### HU-02: Gestionar un Pedido y Asignar un Repartidor
**Como** Laura, **quiero** recibir una notificación de un nuevo pedido, verlo en mi panel, cambiar su estado a "En preparación" y asignárselo a un repartidor disponible, **para** coordinar la operación de la cocina y la logística de entrega.

- **Checklist de Prueba:**
  - [ ] Al llegar un nuevo pedido, recibo una notificación sonora y/o visual en el panel `/admin/orders`.
  - [ ] El pedido de Ana aparece en la columna "Nuevos".
  - [ ] Puedo cambiar el estado del pedido a "En preparación". El pedido se mueve a la columna correspondiente.
  - [ ] Veo una lista de repartidores activos.
  - [ ] Puedo asignar el pedido a "Juan Pérez (repartidor)".
  - [ ] El repartidor asignado recibe una notificación del nuevo pedido.

---

### Persona 3: Juan, el Repartidor
**Objetivo:** Gestionar las entregas asignadas de forma clara y eficiente.

#### HU-03: Completar una Entrega Asignada
**Como** Juan, **quiero** poder marcarme como "disponible", recibir un nuevo pedido, ver la ruta óptima para la entrega, marcar el pedido como "Entregado" y registrar el pago, **para** cumplir con mi trabajo y llevar un control del dinero recaudado.

- **Checklist de Prueba:**
  - [ ] Puedo iniciar sesión y activar mi estado a "Disponible" en mi interfaz de repartidor.
  - [ ] Recibo una notificación push con el pedido de Ana que me asignó Laura.
  - [ ] Puedo ver los detalles del pedido y la dirección del cliente en un mapa.
  - [ ] Puedo hacer clic en un botón "Navegar" que me abre Google Maps con la ruta.
  - [ ] Una vez en el domicilio, puedo cambiar el estado a "Entregado".
  - [ ] El cliente (Ana) y la administradora (Laura) ven el estado actualizado a "Entregado".
  - [ ] Puedo registrar que el pago fue recibido (ej. "Efectivo" o "Confirmado por QR").
  - [ ] En mi resumen diario, el monto del pedido de Ana se suma a mi total recaudado.
