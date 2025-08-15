# Historias de Usuario de la PWA de Pedidos

Este documento detalla los flujos clave desde la perspectiva de los diferentes roles (personas) que interactúan con la aplicación.

---

## Persona 1: Cliente
**Objetivo:** Pedir comida de forma rápida y sencilla.

### HU-01: Realizar un pedido
**Como** cliente,
**Quiero** poder navegar por el menú, añadir productos (con opciones) a un carrito persistente, y finalizar mi pedido,
**Para** recibir mi comida en casa.
- **Checklist:**
  - [ ] Puedo ver categorías y productos.
  - [ ] Puedo añadir un producto simple al carrito.
  - [ ] Puedo personalizar un producto con opciones (ej. tamaño) y añadirlo.
  - [ ] El carrito se mantiene si recargo la página.
  - [ ] Puedo finalizar el pedido (checkout).
  - [ ] Recibo un enlace para seguir mi pedido en tiempo real.

### HU-02: Gestionar mi cuenta
**Como** cliente registrado,
**Quiero** poder ver mis pedidos anteriores y marcar platos como favoritos,
**Para** agilizar futuras compras.
- **Checklist:**
  - [ ] Puedo registrarme e iniciar sesión.
  - [ ] Tengo una sección de "Mis Pedidos" con mi historial.
  - [ ] Puedo marcar/desmarcar un producto como favorito.
  - [ ] Existe una sección "Mis Favoritos".

---

## Persona 2: Administrador del Local
**Objetivo:** Gestionar las operaciones del restaurante de forma eficiente.

### HU-03: Gestionar el catálogo
**Como** administrador,
**Quiero** poder crear, leer, actualizar y eliminar productos y categorías,
**Para** mantener el menú siempre al día.
- **Checklist:**
  - [ ] Puedo acceder a un panel de administración seguro.
  - [ ] Existe un CRUD completo para Productos.
  - [ ] Existe un CRUD completo para Categorías.

### HU-04: Gestionar pedidos entrantes
**Como** administrador,
**Quiero** ver los pedidos en tiempo real y cambiar su estado,
**Para** coordinar la cocina y mantener al cliente informado.
- **Checklist:**
  - [ ] Veo los nuevos pedidos en un dashboard.
  - [ ] Puedo actualizar el estado (Pendiente -> En preparación -> En camino -> Entregado).
  - [ ] El cliente ve el cambio de estado en su página de seguimiento.

### HU-05: Analizar el rendimiento
**Como** administrador,
**Quiero** ver reportes de ventas y productos más vendidos,
**Para** tomar decisiones de negocio informadas.
- **Checklist:**
  - [ ] El dashboard muestra métricas clave (ingresos, total de pedidos).
  - [ ] Hay un gráfico de ventas a lo largo del tiempo.
  - [ ] Hay un ranking de los productos más populares.

---

## Persona 3: Repartidor
**Objetivo:** Ver los pedidos asignados y gestionar las entregas.

### HU-06: Gestionar entregas
**Como** repartidor,
**Quiero** tener una interfaz simple para ver los pedidos que debo entregar y marcarlos como completados,
**Para** optimizar mi ruta y mi tiempo.
- **Checklist:**
  - [ ] Puedo iniciar sesión con un rol de "Repartidor".
  - [ ] Veo una lista de pedidos asignados con dirección.
  - [ ] Puedo marcar un pedido como "Entregado".
  - [ ] (Futuro) Mi ubicación se actualiza en el mapa del cliente.
