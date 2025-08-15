
# Plan de Mejoras y Estado de Avance

Este documento realiza un seguimiento de las mejoras propuestas para la PWA Duo Eats, inspiradas en el análisis de `pedidosfree.com.ar` y las necesidades detectadas.

---

### 1. Rediseño de UI y Tema Oscuro Mejorado
- **Descripción:** Refinar la paleta de colores y los estilos de la aplicación para una apariencia más moderna y profesional, con especial atención al modo oscuro.
- **Estado:** ✅ **Completado**
- **Progreso:** `[██████████]` (100%)

---

### 2. Product Cards con Selector de Cantidad
- **Descripción:** Añadir botones `+/-` directamente en las tarjetas de producto en la página de inicio. Una vez que un producto está en el carrito, la tarjeta debería mostrar la cantidad actual y permitir modificarla rápidamente sin abrir el panel de detalles.
- **Estado:** ✅ **Completado**
- **Progreso:** `[██████████]` (100%)

---

### 3. Chatbot Asistente con IA
- **Descripción:** Implementar un chatbot flotante utilizando Genkit. El bot debe poder responder preguntas de los clientes sobre horarios, días de apertura y otra información de la tienda, consultando los datos desde Firestore en tiempo real.
- **Estado:** ⚙️ **En Progreso**
- **Progreso:** `[█████     ]` (50%)
- **Notas:** La lógica del backend (`flow` de Genkit) y las herramientas (`tools`) para obtener la información de la tienda ya están implementadas. Falta construir la interfaz de usuario del chat.

---

### 4. Confirmación de Pedido en la App (Sin Redirección a WhatsApp)
- **Descripción:** Modificar el flujo de checkout para que, después de confirmar el pedido, el cliente vea una página de éxito y seguimiento directamente en la aplicación. El pedido se envía al panel del administrador sin requerir que el cliente envíe un mensaje de WhatsApp. El número de teléfono se captura para contacto manual si es necesario.
- **Estado:** ⚙️ **En Progreso**
- **Progreso:** `[█████     ]` (50%)
- **Notas:** La lógica para crear el pedido sin la redirección a WhatsApp está parcialmente implementada. Falta refinar la página de confirmación y el flujo post-pedido.

---

### 5. Gestión de Ajustes de la Tienda desde el Admin
- **Descripción:** Crear una sección en el panel de administración (`/admin/settings`) donde el dueño del local pueda gestionar fácilmente los horarios de apertura, días de atención y el número de WhatsApp para contacto.
- **Estado:** ⚙️ **En Progreso**
- **Progreso:** `[█████     ]` (50%)
- **Notas:** Las funciones de backend (`actions`) para leer y escribir los ajustes en Firestore ya están creadas. Falta implementar el formulario y la interfaz en el panel de administración.

