
import { test, expect } from '@playwright/test';

test.describe('Flujo de Checkout como Invitado', () => {
  test.beforeEach(async ({ page }) => {
    // Visitar la página de inicio antes de cada prueba
    await page.goto('/');
  });

  test('debería permitir a un usuario añadir un producto al carrito y completar el pedido', async ({ page }) => {
    // 1. **Añadir un producto al carrito desde la página de inicio**
    await expect(page.getByRole('heading', { name: 'Menú Completo' })).toBeVisible();
    
    // Hacemos clic en el botón de añadir del primer producto que no tenga opciones complejas
    await page.locator('.group').filter({ hasText: 'Hamburguesa Doble Clásica' }).getByRole('button', { name: 'Añadir' }).click();

    // El toast de confirmación debería aparecer
    await expect(page.getByText('¡Añadido al carrito!')).toBeVisible();

    // 2. **Navegar al carrito de compras**
    await page.getByLabel('Carrito').click();
    await expect(page).toHaveURL('/cart');

    // 3. **Completar la información del checkout**
    await expect(page.getByRole('heading', { name: 'Mi Carrito' })).toBeVisible();

    // Rellenar nombre del invitado
    await page.getByLabel('Nombre').fill('Cliente de Prueba');

    // Seleccionar la opción de envío a domicilio (ya está por defecto)
    // Escribir una dirección manualmente
    await page.getByLabel('Dirección Completa').fill('Av. Corrientes 1234');
    await page.getByLabel('Barrio').fill('Palermo');
    
    // Esperamos a que aparezca el costo de envío
    await expect(page.getByText('A calcular')).not.toBeVisible();
    await expect(page.getByText(/Envío\$[0-9,.]+/).or(page.getByText('Gratis'))).toBeVisible();

    // 4. **Finalizar el pedido y verificar la redirección**
    await page.getByRole('button', { name: 'Finalizar Pedido' }).click();

    // 5. **Verificar que somos redirigidos a la página de seguimiento del pedido**
    await expect(page).toHaveURL(/\/order\/.*/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Seguimiento de Pedido' })).toBeVisible();
    await expect(page.getByText('Pendiente')).toBeVisible();
  });
});

    