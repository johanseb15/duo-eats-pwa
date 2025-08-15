# Plan de Acción y Estado de Avance

Este documento detalla la hoja de ruta para la implementación de funcionalidades en la PWA Duo Eats, basada en un análisis de requerimientos completo.

---

### Módulo 1: Experiencia del Cliente (PWA)

- **[✅] Registro/Login Flexible:**
  - [✅] Implementar login social (Google).
  - [✅] Añadir recuperación de contraseña.
- **[✅] Menú Interactivo y Offline:**
  - [✅] Carga diferida de imágenes.
  - [✅] Cachear productos para navegación sin conexión.
- **[✅] Carrito Persistente:**
  - [✅] Guardar carrito en `localStorage`.
  - [✅] Permitir notas personalizadas por producto.
- **[✅] Checkout Rápido y Eficiente:**
  - [⏳] Integración con geolocalización (pin en mapa). (Pospuesto)
  - [✅] Soportar múltiples métodos de pago (efectivo, QR, POS).
- **[✅] Seguimiento de Pedido en Tiempo Real:**
  - [✅] Visualización de estados del pedido.
  - [⏳] Implementar notificaciones push ante cambios de estado. (Pospuesto)
- **[✅] Historial y Favoritos:**
  - [✅] Gestionar una lista de productos favoritos.
  - [✅] Permitir repetir un pedido anterior con un clic.

---

### Módulo 2: Panel de Administración

- **[✅] Dashboard en Tiempo Real:**
  - [✅] Notificaciones sonoras/visuales para nuevos pedidos.
  - [✅] Vista de pedidos por estado (Nuevos, En Preparación, Listos).
- **[✅] Gestión de Catálogo Completa:**
  - [✅] CRUD de productos con stock.
  - [✅] CRUD de categorías.
- **[ ] Gestión de Repartidores:**
  - [ ] CRUD de repartidores.
  - [ ] Asignación manual de pedidos a repartidores activos.
- **[ ] Reportes y Analítica:**
  - [ ] Filtros por fecha, repartidor y método de pago.
  - [ ] Visualización de productos más vendidos.
- **[ ] Control de Caja:**
  - [ ] Reporte de cuadre diario por repartidor.
- **[ ] Múltiples Roles:**
  - [ ] Definir permisos para Admin, Cajero y Cocina.

---

### Módulo 3: Módulo de Repartidor (PWA)

- **[ ] Gestión de Disponibilidad:**
  - [ ] Botón para activarse/desactivarse.
- **[ ] Notificaciones y Asignación:**
  - [ ] Recibir notificaciones push para nuevos pedidos asignados.
- **[ ] Navegación y Seguimiento:**
  - [ ] Ver detalle del pedido y ubicación del cliente en un mapa.
  - [ ] Integrar con Google Maps/Waze para la ruta.
- **[ ] Gestión de Cobros:**
  - [ ] Confirmar pago (efectivo, POS).
- **[ ] Historial de Entregas:**
  - [ ] Ver pedidos completados y total recaudado en el día.

---

### Módulo 4: Capacidades Técnicas (Fundamento)

- **[ ] Offline-First Real:**
  - [✅] Cachear assets y datos con Service Worker.
  - [ ] Sincronización de pedidos al recuperar conexión.
- **[ ] Notificaciones Push Web:**
  - [⏳] Configurar Firebase Cloud Messaging (FCM). (Pospuesto)
- **[ ] Rendimiento Optimizado (Lighthouse):**
  - [✅] Optimizar imágenes a formato WebP.
  - [ ] Minificar y empaquetar código CSS/JS.
- **[ ] Seguridad Robusta:**
  - [ ] Implementar Custom Claims en Firebase para roles.
  - [ ] Proteger APIs con JWT.
