
# Informe Técnico del Proyecto: Duo Eats

**Fecha:** 14 de agosto de 2025
**Versión del Documento:** 1.0

## 1. Resumen Ejecutivo

Este documento detalla la arquitectura técnica y las funcionalidades implementadas en la aplicación **Duo Eats**, una Progressive Web App (PWA) de pedidos de comida diseñada para ofrecer una experiencia de usuario moderna, rápida y robusta.

El proyecto se ha desarrollado sobre una pila tecnológica moderna, integrando un backend serverless con Firebase, un frontend reactivo con Next.js y capacidades de inteligencia artificial con Google Genkit. La aplicación está estructurada para ser completamente funcional sin conexión a una base de datos (utilizando datos de prueba), lo que facilita el desarrollo y las pruebas iterativas.

Actualmente, la plataforma soporta un flujo completo de pedidos, gestión de catálogos, autenticación de usuarios, un panel de administración con analíticas y roles de usuario avanzados (Admin y Superadmin).

---

## 2. Arquitectura Tecnológica

La aplicación se basa en las siguientes tecnologías principales:

- **Framework Frontend:** **Next.js 15 (con App Router)**, utilizando React 18 para la construcción de componentes. Se prioriza el uso de Server Components para optimizar el rendimiento.
- **Estilos y UI:**
    - **Tailwind CSS:** Para un diseño de utilidades rápido y personalizable.
    - **ShadCN UI:** Como librería de componentes base, ofreciendo componentes accesibles y personalizables como botones, diálogos, formularios, etc.
    - **Lucide Icons:** Para una iconografía limpia y consistente.
- **Backend y Base de Datos:** **Firebase (Firestore)** como base de datos NoSQL en tiempo real. La interacción se realiza a través del SDK de cliente y el SDK de Admin para operaciones seguras del lado del servidor.
- **Autenticación:** **Firebase Authentication**, configurado para permitir el inicio de sesión con proveedores de OAuth (Google) y la gestión de usuarios.
- **Inteligencia Artificial:** **Google Genkit**, integrado para proporcionar funcionalidades inteligentes como:
    - Sugerencia de iconos para categorías de productos.
    - Recomendaciones personalizadas de productos basadas en el historial del usuario.
- **Gestión de Estado (Cliente):** **Zustand**, utilizado para la gestión del estado global del carrito de compras, con persistencia en `localStorage`.
- **Integraciones Adicionales:**
    - **Google Maps Platform:** Para el autocompletado de direcciones en el checkout y la asignación automática de zonas de entrega.
    - **Embla Carousel:** Para los carruseles de promociones, con plugin de autoplay.
    - **Recharts:** Para la visualización de datos y analíticas en el panel de administración.
- **Entorno y Despliegue:** La aplicación está configurada para ser desplegada en **Firebase App Hosting**.

---

## 3. Estructura del Proyecto

El código fuente está organizado de manera modular para facilitar el mantenimiento y la escalabilidad:

- `src/app/`: Contiene las rutas de la aplicación siguiendo la convención del App Router de Next.js. Incluye las páginas públicas, las del panel de administración (`/admin`) y las del superadministrador (`/superadmin`).
- `src/components/`: Alberga los componentes reutilizables de React, incluyendo componentes de UI (`/ui`), formularios y componentes cliente complejos.
- `src/lib/`: Módulos de utilidad, configuración de Firebase (`firebase.ts`, `firebase-admin.ts`) y definiciones de tipos de TypeScript (`types.ts`).
- `src/ai/`: Contiene toda la lógica relacionada con Genkit, incluyendo la definición de flujos (`/flows`) y la configuración del cliente de IA.
- `src/store/`: Define los stores de Zustand para la gestión del estado global.
- `public/`: Archivos estáticos como imágenes (logo) y el manifiesto de la PWA.

---

## 4. Funcionalidades Implementadas

### 4.1. Módulo de Cliente (Cara al Público)

- **Catálogo de Productos:**
    - Visualización de productos y categorías en la página de inicio.
    - Navegación a páginas de categorías específicas (`/category/[slug]`).
    - Los datos se cargan desde Firestore, con un sistema de respaldo de datos de prueba (`testProducts`, `testCategories`) que garantiza la resiliencia y el funcionamiento sin conexión a la base de datos.

- **Detalle y Personalización de Productos:**
    - Ficha de producto detallada que se abre en un panel lateral (`Sheet`).
    - Soporte completo para **opciones de producto** (ej. tamaño, adicionales) con modificadores de precio.
    - El precio se actualiza dinámicamente en la interfaz a medida que el cliente selecciona opciones.

- **Carrito de Compras:**
    - Carrito de compras persistente (usando Zustand y `localStorage`) que funciona tanto para usuarios invitados como registrados.
    - Funcionalidades para añadir, eliminar, actualizar cantidad y vaciar el carrito.
    - Identificación única de ítems en el carrito basada en el producto y las opciones seleccionadas.

- **Flujo de Checkout:**
    - **Autocompletado de Dirección:** Integración con la API de Google Maps para sugerir y validar la dirección del cliente.
    - **Cálculo Automático de Envío:** Basado en el barrio extraído de la dirección, el sistema selecciona automáticamente la zona de entrega y calcula el costo.
    - **Opción de Retiro en Local:** El usuario puede optar por no recibir a domicilio.
    - **Pedidos de Invitados y Registrados:** El sistema maneja ambos flujos, guardando el pedido en Firestore en cualquier caso.
    - **Integración con WhatsApp:** Al finalizar, se genera un mensaje de WhatsApp pre-rellenado con los detalles del pedido para una confirmación rápida.

- **Seguimiento de Pedidos:**
    - Página de seguimiento dedicada (`/order/[id]`) accesible a través de un enlace único, permitiendo a invitados y usuarios registrados ver el estado de su pedido en tiempo real.
    - El estado del pedido se actualiza automáticamente a intervalos regulares.

- **Autenticación y Perfil de Usuario:**
    - Registro e inicio de sesión con Google.
    - Página de perfil donde el usuario puede ver su información y acceder a su historial de pedidos.
    - Acceso condicional a los paneles de Admin y Superadmin desde el perfil si el usuario tiene los permisos adecuados.

- **Recomendaciones por IA:**
    - Un componente en la página de inicio sugiere productos al usuario.
    - Si el usuario está logueado, las recomendaciones son personalizadas y se basan en su historial de compras, procesado por un flujo de Genkit.

### 4.2. Módulo de Administración

El panel, accesible en `/admin`, está protegido y solo es visible para los usuarios definidos como administradores.

- **Dashboard de Analíticas:**
    - Página principal con métricas clave: Ingresos totales, número de pedidos y ticket promedio.
    - Gráficos interactivos que muestran la tendencia de pedidos de los últimos 7 días y los 5 productos más vendidos.
    - Tabla con un resumen de los pedidos más recientes.

- **Gestión de Pedidos:**
    - Visualización en tiempo real de todos los pedidos entrantes.
    - Capacidad para actualizar el estado de un pedido (`Pendiente`, `En preparación`, `En camino`, `Entregado`, `Cancelado`).
    - Búsqueda por nombre de cliente o ID de pedido.

- **Gestión de Productos:**
    - CRUD completo (Crear, Leer, Actualizar, Eliminar) para productos.
    - Formulario avanzado para añadir y editar productos, incluyendo nombre, descripción, precio, stock, categoría e imagen.
    - **Gestión de Opciones de Producto:** Interfaz dinámica para añadir/eliminar opciones y sus respectivos valores con modificadores de precio.

- **Gestión de Categorías:**
    - CRUD completo para categorías de productos.
    - **Sugerencia de Iconos por IA:** Un asistente con IA sugiere un icono de la librería `lucide-react` basado en el nombre de la categoría, agilizando el proceso.

- **Gestión de Promociones:**
    - CRUD completo para banners de promociones que se muestran en el carrusel de la página de inicio.

- **Gestión de Zonas de Entrega:**
    - CRUD completo para zonas de entrega, permitiendo definir un costo de envío para una lista de barrios.

### 4.3. Módulo de Superadministración

El panel, accesible en `/superadmin`, está protegido y solo es visible para los superadministradores.

- **Gestión de Usuarios y Roles:**
    - Visualización de una tabla con **todos los usuarios registrados** en la aplicación, obtenida a través del SDK de Admin de Firebase.
    - Identificación clara de los usuarios que tienen rol de "Admin".
    - El sistema de roles se gestiona de forma segura a través de variables de entorno (`NEXT_PUBLIC_ADMIN_UIDS`, `NEXT_PUBLIC_SUPERADMIN_UIDS`).

---

## 5. Próximos Pasos y Mejoras Potenciales

- **Notificaciones Push:** Implementar notificaciones para actualizar al cliente sobre el estado de su pedido.
- **Integración con Pasarelas de Pago:** Añadir soporte para pagos con tarjeta de crédito/débito (ej. Stripe, Mercado Pago).
- **Gestión de Stock Avanzada:** Decremento automático de stock al realizar un pedido y alertas de bajo stock.
- **Internacionalización (i18n):** Preparar la aplicación para múltiples idiomas y monedas.
- **Pruebas Automatizadas:** Implementar un conjunto de pruebas unitarias y de extremo a extremo para garantizar la calidad del código.
