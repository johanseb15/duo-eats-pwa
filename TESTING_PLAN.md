# Plan de Pruebas Exhaustivo - Duo Eats

Este documento detalla un plan de pruebas completo para garantizar la calidad, robustez y rendimiento de la PWA Duo Eats. Las pruebas se organizan en cuatro categorías clave para cubrir todos los aspectos de la aplicación.

---

### 1. Pruebas Funcionales

**Objetivo:** Verificar que cada componente y flujo individual de la aplicación funcione según lo esperado.

- **[ ] Carga offline (PWA):**
  - Abrir la aplicación sin conexión a internet.
  - **Resultado esperado:** El menú, las categorías y los productos en el carrito deben seguir siendo visibles y accesibles.

- **[ ] Navegación de productos:**
  - Usar la barra de búsqueda con términos completos ("Pizza Napolitana") y parciales ("napo").
  - Filtrar productos haciendo clic en diferentes categorías.
  - **Resultado esperado:** La lista de productos se filtra correctamente y de forma instantánea.

- **[ ] Carrito y personalización:**
  - Añadir y eliminar varios productos.
  - Aumentar y disminuir la cantidad de un ítem hasta quitarlo del carrito.
  - Añadir notas especiales a un producto.
  - **Resultado esperado:** El precio total y subtotal se actualiza correctamente. Las notas se guardan y son visibles en el checkout.

- **[ ] Checkout y validaciones:**
  - Intentar finalizar un pedido sin completar campos obligatorios (nombre de invitado, dirección).
  - Introducir datos mal formateados (ej. un teléfono con letras).
  - Introducir una dirección en un barrio que no tiene una zona de reparto configurada.
  - **Resultado esperado:** El sistema muestra mensajes de error claros y no permite continuar hasta que los datos sean correctos. Muestra una alerta si la dirección está fuera de la zona de cobertura.

- **[ ] Confirmación de pedido:**
  - Realizar un pedido correctamente.
  - **Resultado esperado:** El backend recibe la orden, la guarda en la base de datos con el estado "Pendiente" y redirige al cliente a la página de seguimiento.

---

### 2. Pruebas de Integración

**Objetivo:** Asegurar que los diferentes módulos de la aplicación (Cliente, Admin, Repartidor, Backend) se comunican y funcionan correctamente en conjunto.

- **[ ] Notificación en panel Admin:**
  - Realizar un nuevo pedido desde la PWA del cliente.
  - **Resultado esperado:** El panel de administración (`/admin/orders`) debe recibir una alerta sonora y visual de inmediato.

- **[ ] Cambio de estado en tiempo real:**
  - Desde el panel de Admin, cambiar el estado de un pedido: "Pendiente" -> "En preparación" -> "En camino" -> "Entregado".
  - **Resultado esperado:** La página de seguimiento del cliente (`/order/[id]`) y la PWA del repartidor deben reflejar cada cambio de estado casi instantáneamente, sin necesidad de recargar la página.

- **[ ] Asignación de repartidor:**
  - Asignar un pedido a un repartidor activo desde el panel de Admin.
  - **Resultado esperado:** El pedido aparece automáticamente en la PWA del repartidor asignado.

- **[ ] Integración con Google Maps:**
  - Desde la PWA del repartidor, hacer clic en el botón para navegar a la dirección del cliente.
  - **Resultado esperado:** Se abre Google Maps en una nueva pestaña con la dirección del cliente ya cargada y lista para iniciar la ruta.

- **[ ] Sincronización de stock:**
  - Realizar un pedido de un producto con stock limitado.
  - **Resultado esperado:** El stock del producto en la base de datos se reduce correctamente. Si el stock llega a cero, el producto debe aparecer como "Sin Stock" en la tienda.

---

### 3. Pruebas de Experiencia de Usuario (UX)

**Objetivo:** Evaluar la facilidad de uso, la claridad de la interfaz y la satisfacción general del usuario.

- **[ ] Tiempo de carga inicial:**
  - Medir el tiempo que tarda la aplicación en ser interactiva en una conexión 4G simulada.
  - **Resultado esperado:** La carga inicial debe ser inferior a 3 segundos.

- **[ ] Gestos y accesibilidad móvil:**
  - Navegar por toda la aplicación usando solo una mano en un dispositivo móvil.
  - **Resultado esperado:** Los botones principales (especialmente en la barra de navegación inferior) deben ser grandes y fáciles de alcanzar.

- **[ ] Confirmaciones claras:**
  - Realizar acciones clave como añadir al carrito, hacer un pedido o marcar un favorito.
  - **Resultado esperado:** El sistema proporciona feedback visual inmediato (toasts, animaciones) para confirmar que la acción se completó con éxito.

- **[ ] Modo invitado vs. registrado:**
  - Completar un pedido como invitado.
  - Completar un pedido con un usuario registrado.
  - **Resultado esperado:** Ambas experiencias deben ser fluidas y lógicas, con la ventaja de las direcciones guardadas para el usuario registrado.

- **[ ] Feedback post-entrega (funcionalidad futura):**
  - Una vez implementado, verificar que el cliente reciba una invitación para calificar el pedido.
  - **Resultado esperado:** El cliente puede dejar una calificación y marcar productos como favoritos fácilmente.

---

### 4. Pruebas de Rendimiento y Escalabilidad

**Objetivo:** Medir la capacidad de respuesta de la aplicación bajo condiciones de uso real y carga alta.

- **[ ] Simulación de pedidos simultáneos:**
  - Usar herramientas de scripting para simular la creación de 50-100 pedidos en un corto período de tiempo.
  - **Resultado esperado:** El sistema debe procesar todos los pedidos sin caídas ni errores en la base de datos.

- **[ ] Latencia de actualización de estado:**
  - Medir el tiempo que transcurre desde que un admin cambia un estado hasta que se refleja en la vista del cliente.
  - **Resultado esperado:** La latencia debe ser inferior a 1 segundo.

- **[ ] Resiliencia de conexión del repartidor:**
  - En la PWA del repartidor, desactivar la conexión de red, realizar una acción (como intentar cambiar un estado) y luego volver a activar la red.
  - **Resultado esperado:** La aplicación no debe perder datos y debe intentar sincronizar el estado una vez que se recupera la conexión.

- **[ ] Consumo de batería y datos:**
  - Dejar la PWA del repartidor abierta durante una sesión larga (1-2 horas) con actualizaciones en tiempo real activadas.
  - **Resultado esperado:** El consumo de batería y datos debe ser eficiente y no drenar excesivamente los recursos del dispositivo.
