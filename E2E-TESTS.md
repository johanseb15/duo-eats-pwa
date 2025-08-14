# Plantilla de Pruebas End-to-End (E2E) con Cypress

Este documento contiene una plantilla de prueba de Cypress para verificar el flujo de compra principal de la aplicación Duo Eats. Puedes usar este código como base para crear tus archivos de prueba dentro del directorio `cypress/e2e` de tu proyecto.

## Flujo de Prueba: Checkout como Invitado

Este test simula a un usuario que no ha iniciado sesión realizando un pedido completo.

**Nombre del archivo sugerido:** `cypress/e2e/guest-checkout.cy.ts`

```typescript
// cypress/e2e/guest-checkout.cy.ts

describe('Flujo de Checkout como Invitado', () => {
  beforeEach(() => {
    // Visitar la página de inicio antes de cada prueba
    cy.visit('/');
  });

  it('debería permitir a un usuario añadir un producto al carrito y completar el pedido', () => {
    // 1. **Añadir un producto al carrito desde la página de inicio**
    cy.contains('h2', 'Menú Completo').should('be.visible');
    
    // Hacemos clic en el botón "Añadir" del primer producto que encontremos
    // Usamos `first()` para asegurar que solo seleccionamos uno.
    cy.get('button[aria-label="Añadir al carrito"]').first().click();

    // 2. **Verificar que el producto está en el carrito y añadirlo**
    // El panel lateral (Sheet) debería abrirse
    cy.contains('h2', 'Pizza de Muzzarella').should('be.visible'); // Asumimos que el primer producto es este
    cy.get('button').contains('Agregar al carrito').click();

    // El toast de confirmación debería aparecer
    cy.contains('¡Añadido al carrito!').should('be.visible');

    // 3. **Navegar al carrito de compras**
    cy.get('a[href="/cart"]').click();

    // 4. **Completar la información del checkout**
    cy.url().should('include', '/cart');
    cy.contains('h1', 'Mi Carrito').should('be.visible');

    // Rellenar nombre del invitado
    cy.get('input#guestName').type('Cliente de Prueba');

    // Seleccionar la opción de envío a domicilio (ya está por defecto)
    // Escribir una dirección en el autocompletado de Google
    cy.get('input#address-input').type('Av. Corrientes 1234, Buenos Aires');
    
    // Esperamos a que Google Maps responda y aparezca el costo de envío
    // Este `wait` puede ser necesario si la API es lenta. Ajustar si es necesario.
    cy.wait(2000); 
    cy.contains('span', 'A calcular').should('not.exist');
    cy.contains('span', /^\$\d+\.\d{2}$/).should('be.visible'); // Verificar que el costo de envío aparece

    // 5. **Finalizar el pedido (sin clickear en WhatsApp)**
    // Capturamos el evento `window.open` para evitar que se abra una nueva pestaña de WhatsApp
    cy.window().then((win) => {
      cy.stub(win, 'open').as('open');
    });

    cy.get('button').contains('Finalizar y Enviar por WhatsApp').click();

    // 6. **Verificar que se intenta abrir WhatsApp**
    cy.get('@open').should('have.been.calledOnce');

    // 7. **Verificar que somos redirigidos a la página de seguimiento del pedido**
    cy.url().should('include', '/order/');
    cy.contains('h1', 'Seguimiento de Pedido').should('be.visible');
    cy.contains('p', 'Pendiente').should('be.visible');

    // 8. **(Opcional) Verificar el pedido en el panel de administración**
    // Esto requeriría un flujo de login como admin antes de la prueba
    // cy.loginAdmin(); // (Necesitarías crear un custom command para esto)
    // cy.visit('/admin/orders');
    // cy.contains('td', 'Cliente de Prueba').should('be.visible');
  });
});
```

### Notas sobre la Plantilla

*   **Custom Commands:** Para pruebas más complejas, como la de verificar el pedido en el panel de admin, es una buena práctica crear "custom commands" en Cypress (ej. `cy.loginAdmin()`). Esto se configura en `cypress/support/commands.ts`.
*   **Esperas (Waits):** Se ha añadido un `cy.wait(2000)` para dar tiempo a la API de Google Maps a responder. En un entorno de pruebas real, es mejor usar interceptores de red (`cy.intercept()`) para esperar a respuestas de API específicas en lugar de usar esperas fijas.
*   **Selectores:** Las pruebas usan selectores basados en texto (`cy.contains`) o atributos (`a[href="/cart"]`). Para mayor robustez, se recomienda añadir atributos `data-cy` a los elementos clave en tu aplicación para que las pruebas no se rompan si cambias un texto.

---
