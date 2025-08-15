
import { test, expect } from '@playwright/test';

test.describe('Flujo de Checkout como Invitado', () => {
  test.beforeEach(async ({ page }) => {
    // Visitar la página de inicio antes de cada prueba
    await page.goto('/');
  });

  test('debería permitir a un usuario añadir un producto al carrito y completar el pedido', async ({ page }) => {
    // 1. **Añadir un producto al carrito desde la página de inicio**
    await expect(page.getByRole('heading', { name: 'Menú Completo' })).toBeVisible();
    
    // Hacemos clic en el botón "Añadir" del primer producto que encontremos
    await page.getByLabel('Añadir Hamburguesa Doble Clásica al carrito').first().click();

    // 2. **Verificar que el producto está en el carrito y añadirlo**
    // El panel lateral (Sheet) debería abrirse
    await expect(page.getByRole('heading', { name: 'Hamburguesa Doble Clásica' })).toBeVisible();
    await page.getByRole('button', { name: 'Agregar al carrito' }).click();

    // El toast de confirmación debería aparecer
    await expect(page.getByText('¡Añadido al carrito!')).toBeVisible();

    // 3. **Navegar al carrito de compras**
    await page.getByLabel('Carrito').click();
    await expect(page).toHaveURL('/cart');

    // 4. **Completar la información del checkout**
    await expect(page.getByRole('heading', { name: 'Mi Carrito' })).toBeVisible();

    // Rellenar nombre del invitado
    await page.getByLabel('Nombre').fill('Cliente de Prueba');

    // Seleccionar la opción de envío a domicilio (ya está por defecto)
    // Escribir una dirección en el autocompletado de Google
    const addressInput = page.getByPlaceholder('Escribe tu calle y número...');
    await addressInput.fill('Av. Corrientes 1234, Buenos Aires');
    
    // Esperamos a que Google Maps responda y aparezca el costo de envío
    // Playwright maneja las esperas automáticas, pero una espera explícita puede ser útil para APIs lentas.
    await page.waitForTimeout(2000); 
    await expect(page.getByText('A calcular')).not.toBeVisible();
    await expect(page.getByText(/^\$\d+\.\d{2}$/).or(page.getByText('Gratis'))).toBeVisible();

    // 5. **Finalizar el pedido y verificar el popup de WhatsApp**
    // Capturamos el evento de popup antes de hacer clic
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Finalizar y Enviar por WhatsApp' }).click();
    
    const popup = await popupPromise;
    expect(popup.url()).toContain('https://wa.me/');
    await popup.close(); // Cerramos el popup para continuar la prueba

    // 6. **Verificar que somos redirigidos a la página de seguimiento del pedido**
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await expect(page).toHaveURL(/\/order\/.*/);
    await expect(page.getByRole('heading', { name: 'Seguimiento de Pedido' })).toBeVisible();
    await expect(page.getByText('Pendiente')).toBeVisible();
  });
});
