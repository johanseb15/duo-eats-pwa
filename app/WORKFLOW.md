# Flujo Completo de Funcionamiento de la PWA de Pedidos

Este documento detalla el ciclo de vida completo de un pedido dentro de la aplicación Duo Eats, describiendo las interacciones entre el Cliente, el Panel de Administración, el Repartidor y el Backend.

---

### Fase 1: El Cliente Realiza un Pedido

1.  **Cliente - Abre la PWA:** El cliente accede a la aplicación desde su dispositivo. La PWA carga rápidamente, mostrando el menú incluso con conexión limitada gracias al cacheo de datos.
2.  **Cliente - Navega y Selecciona:** El cliente explora las categorías y productos. Añade ítems al carrito, personalizándolos con opciones (ej. "sin cebolla", "tamaño grande") y añadiendo notas si es necesario.
3.  **Cliente - Va al Carrito y Checkout:** El cliente revisa su pedido en el carrito. Procede al checkout, donde introduce sus datos (si es invitado) o selecciona una dirección guardada. Elige el método de entrega (domicilio o retiro) y el método de pago.
4.  **Cliente - Confirma el Pedido:** Al hacer clic en "Finalizar Pedido", la información se envía al backend.

---

### Fase 2: Gestión del Pedido en el Local

5.  **Backend - Registra y Notifica:** El sistema recibe los datos, crea un nuevo documento de pedido en la base de datos con estado "Pendiente" y decrementa el stock de los productos correspondientes.
6.  **Admin - Recibe Notificación:** El panel de administración, que está escuchando cambios, detecta el nuevo pedido. Emite una **notificación sonora y visual** para alertar al personal del local.
7.  **Admin - Revisa y Prepara:** El administrador ve el nuevo pedido en la columna "Pendiente". Cambia su estado a "En preparación", moviendo la tarjeta a la siguiente columna. La cocina comienza a preparar el pedido.
8.  **Admin - Asigna Repartidor:** Una vez que el pedido está casi listo, el administrador selecciona un repartidor disponible de la lista y se lo asigna al pedido a través del panel.

---

### Fase 3: Entrega del Pedido

9.  **Repartidor - Acepta el Pedido:** El repartidor ve el nuevo pedido asignado en su propia PWA. Revisa los detalles (productos, dirección del cliente).
10. **Repartidor - Navega y Recoge:** El repartidor utiliza la integración con Google Maps para ver la ruta hasta el domicilio del cliente. Pasa por el local a recoger el paquete. Cambia el estado del pedido a "En camino".
11. **Repartidor - Entrega y Cobra:** El repartidor llega al domicilio, entrega el pedido al cliente. Si el pago es en efectivo o con POS, realiza el cobro.
12. **Repartidor - Confirma Entrega:** A través de su PWA, el repartidor marca el pedido como "Entregado" y confirma que el pago fue recibido.

---

### Fase 4: Cierre y Retroalimentación

13. **Backend - Actualiza Estado Final:** El sistema actualiza el estado del pedido a "Entregado" en la base de datos.
14. **Cliente - Ve el Pedido Completado:** El cliente puede ver en su historial que el pedido ha sido entregado.
15. **Admin - Cierre de Caja:** Al final del día, el administrador utiliza la sección de "Reportes" para hacer el cuadre de caja del repartidor, viendo el total recaudado en efectivo y otros métodos.
16. **Cliente - Feedback (Opcional):** El cliente tiene la opción de volver a pedir fácilmente desde su historial o marcar productos como favoritos para futuras compras.
