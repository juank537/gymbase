import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should show login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/contraseña/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar/i }).click();
    
    await expect(page.locator('.alert-error')).toBeVisible();
  });

  test('should navigate to register from login', async ({ page }) => {
    await page.getByRole('link', { name: /regístrate/i }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
  });
});

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should show registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/nombre completo/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /registrarse/i })).toBeVisible();
  });

  test('should navigate to login from register', async ({ page }) => {
    await page.getByRole('link', { name: /inicia sesión/i }).click();
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Protected Routes', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing members without auth', async ({ page }) => {
    await page.goto('/members');
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/contraseña/i).fill('Admin123$');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/');
  });

  test('should show dashboard after login', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/hola/i)).toBeVisible();
  });

  test('should navigate to members page', async ({ page }) => {
    await page.getByRole('link', { name: /socios/i }).click();
    await expect(page).toHaveURL('/members');
  });

  test('should show user info in dashboard', async ({ page }) => {
    await expect(page.getByText(/admin@test.com/i)).toBeVisible();
  });
});

test.describe('Members Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@test.com');
    await page.getByLabel(/contraseña/i).fill('Admin123$');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/');
    await page.getByRole('link', { name: /socios/i }).click();
    await page.waitForURL('/members');
  });

  test('should show members list', async ({ page }) => {
    await expect(page.locator('.card')).first().toBeVisible();
  });

  test('should show pagination controls', async ({ page }) => {
    await expect(page.getByRole('button', { name: /siguiente/i })).toBeVisible();
  });
});