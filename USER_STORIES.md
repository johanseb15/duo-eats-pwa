# Historias de Usuario de Duo Eats

Este documento detalla los flujos clave de la aplicación desde la perspectiva de los diferentes tipos de usuarios (o "personas"). Cada historia incluye criterios de aceptación que actúan como una lista de verificación (checklist) para confirmar que la funcionalidad se ha implementado correctamente.

---

## Persona 1: Ana, la Cliente Nueva (Usuario Invitado)
Ana ha escuchado sobre Duo Eats por un amigo y quiere probar la comida. No quiere crear una cuenta todavía, solo quiere pedir algo rápido para la cena.

### Historia de Usuario 1: Realizar un pedido completo como invitado
**Como** Ana, una cliente nueva,
**Quiero** poder explorar el menú, personalizar una hamburguesa con queso extra, añadir una bebida, ingresar mi dirección y confirmar mi pedido por WhatsApp,
**Para** poder recibir mi cena de forma rápida y sin la necesidad de registrarme.

#### Criterios de Aceptación (Checklist de Prueba):

- [ ] **1. Navegación:** Puedo entrar a la página y ver inmediatamente los productos y categorías.
- [ ] **2. Personalización:** Al hacer clic en una hamburguesa, se abre un panel lateral (Sheet).
- [ ] **3. Modificador de Precio:** Al seleccionar "queso extra", el precio total del producto se actualiza instantáneamente en la pantalla.
- [ ] **4. Carrito:** Puedo añadir la hamburguesa personalizada al carrito. El ícono del carrito muestra el número de ítems.
- [ ] **5. Añadir más productos:** Puedo cerrar el panel, seleccionar una bebida y añadirla al carrito.
- [ ] **6. Ver Carrito:** Al abrir el carrito, veo la hamburguesa con sus opciones detalladas y la bebida, junto con el subtotal correcto.
- [ ] **7. Checkout:** Al proceder al checkout, se me pide mi nombre y teléfono.
- [ ] **8. Autocompletado de Dirección:** El campo de dirección me da sugerencias de Google Maps mientras escribo.
- [ ] **9. Costo de Envío:** Al seleccionar mi dirección, el sistema reconoce mi barrio y calcula automáticamente el costo de envío, sumándolo al total del pedido.
- [ ] **10. Finalización:** Al confirmar, se abre una nueva pestaña de WhatsApp con un mensaje pre-rellenado que incluye el resumen completo de mi pedido (productos, opciones, dirección y total).
- [ ] **11. Seguimiento:** Recibo un enlace único a la página de seguimiento (`/order/[id]`).
- [ ] **12. Persistencia:** Si cierro la página accidentalmente y la vuelvo a abrir, los productos siguen en mi carrito (prueba de localStorage).

---

## Persona 2: Carlos, el Cliente Frecuente (Usuario Registrado)
Carlos pide comida en Duo Eats todas las semanas. Valora la conveniencia y le gusta que la aplicación "recuerde" sus preferencias.

### Historia de Usuario 2: Usar las ventajas de una cuenta registrada
**Como** Carlos, un cliente registrado,
**Quiero** iniciar sesión con mi cuenta de Google, ver recomendaciones de productos basadas en mis pedidos anteriores y acceder a mi historial para repetir un pedido fácilmente,
**Para** tener una experiencia de compra más rápida y personalizada.

#### Criterios de Aceptación (Checklist de Prueba):

- [ ] **1. Autenticación:** Puedo hacer clic en "Iniciar Sesión" y autenticarme exitosamente con mi cuenta de Google.
- [ ] **2. UI Personalizada:** La interfaz me saluda por mi nombre y el botón de "Iniciar Sesión" se convierte en un ícono de perfil.
- [ ] **3. Recomendaciones IA:** En la página de inicio, aparece un componente de "Sugerencias para ti" con productos que he pedido antes o similares (prueba del flujo de Genkit).
- [ ] **4. Acceso al Perfil:** Puedo acceder a mi perfil (`/profile`) desde el menú.
- [ ] **5. Historial de Pedidos:** En mi perfil, veo una lista de todos mis pedidos anteriores con su fecha y estado.
- [ ] **6. Repetir Pedido (Simulado):** Al ver un pedido anterior, puedo ver los productos que contenía, lo que me facilita volver a añadirlos al carrito en la tienda.
- [ ] **7. Acceso a Admin (Condicional):** Como no soy administrador, no veo ningún enlace al panel de administración en mi perfil.

---

## Persona 3: Laura, la Gerente del Local (Usuario Administrador)
Laura es la responsable de gestionar las operaciones diarias del restaurante. Necesita una herramienta eficiente para ver y procesar los pedidos a medida que llegan y para mantener el menú actualizado.

### Historia de Usuario 3: Gestionar pedidos y productos del día
**Como** Laura, la gerente del local,
**Quiero** iniciar sesión para acceder al panel de administración, ver el pedido de Ana en tiempo real, actualizar su estado a "En preparación" y luego a "En camino", y finalmente añadir una nueva categoría de "Postres" con un ícono sugerido por la IA,
**Para** mantener a los clientes informados y el catálogo de productos al día.

#### Criterios de Aceptación (Checklist de Prueba):

- [ ] **1. Acceso Seguro:** Puedo iniciar sesión con mi cuenta de Google (que tiene permisos de admin) y acceder a `/admin`.
- [ ] **2. Dashboard:** La página principal del panel me muestra las métricas clave y los últimos pedidos.
- [ ] **3. Pedido en Tiempo Real:** El nuevo pedido de Ana aparece en la tabla de "Gestión de Pedidos" casi instantáneamente.
- [ ] **4. Actualización de Estado:** Puedo cambiar el estado del pedido de Ana a "En preparación". El cambio se guarda correctamente.
- [ ] **5. Verificación de Cliente:** Si Ana revisa su página de seguimiento, ahora ve el estado "En preparación".
- [ ] **6. Segunda Actualización:** Puedo cambiar el estado del mismo pedido a "En camino".
- [ ] **7. Gestión de Categorías:** Puedo ir a la sección "Categorías" y hacer clic en "Añadir Nueva".
- [ ] **8. Sugerencia de Icono IA:** Al escribir "Postres" en el campo del nombre, el sistema me sugiere automáticamente un ícono relevante (ej. `Cake`, `IceCream`) de la librería Lucide.
- [ ] **9. Creación:** Puedo crear la categoría "Postres" y esta aparece inmediatamente en la lista.
- [ ] **10. Verificación en Tienda:** Si visito la página principal, la nueva categoría "Postres" ya es visible para los clientes.
