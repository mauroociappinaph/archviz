import { test, expect } from "@playwright/test";

test.describe("FASE 1: Validación de URL", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("debe mostrar estado idle inicialmente", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");
    await expect(input).toHaveValue("");

    // No debe haber mensaje de validación ni iconos
    await expect(page.getByText("Valid GitHub repository")).not.toBeVisible();
    await expect(page.getByText("Invalid GitHub URL")).not.toBeVisible();
  });

  test("debe validar formato correcto de URL", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");

    await input.fill("https://github.com/facebook/react");

    // Esperar a que se complete la validación
    await expect(page.getByText("✓ Valid GitHub repository")).toBeVisible({ timeout: 10000 });

    // El input debe tener borde verde
    await expect(input).toHaveClass(/border-emerald-500/);
  });

  test("debe rechazar URL inválida", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");

    await input.fill("not-a-url");

    // Mensaje de error debe aparecer
    await expect(page.getByText("Invalid GitHub URL format")).toBeVisible();

    // El input debe tener borde rojo
    await expect(input).toHaveClass(/border-red-500/);
  });

  test("debe validar URL sin protocolo https", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");

    await input.fill("github.com/facebook/react");

    await expect(page.getByText("Checking repository...")).toBeVisible({ timeout: 5000 });
    await expect(page.getByText("✓ Valid GitHub repository")).toBeVisible({ timeout: 10000 });
  });

  test("debe validar URL con www", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");

    await input.fill("https://www.github.com/facebook/react");

    await expect(page.getByText("✓ Valid GitHub repository")).toBeVisible({ timeout: 10000 });
  });

  test("debe mostrar error para repo inexistente", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");

    await input.fill("https://github.com/this-owner-does-not-exist-12345/fake-repo");

    await expect(page.getByText("Repository not found or not public")).toBeVisible({ timeout: 10000 });
  });

  test("debe deshabilitar botón Analyze si URL es inválida", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");
    const analyzeButton = page.getByRole("button", { name: /Analyze/i });

    // Inicialmente deshabilitado
    await expect(analyzeButton).toBeDisabled();

    // URL inválida - sigue deshabilitado
    await input.fill("invalid-url");
    await expect(analyzeButton).toBeDisabled();

    // URL válida - debe habilitarse
    await input.fill("https://github.com/facebook/react");
    await expect(page.getByText("✓ Valid GitHub repository")).toBeVisible({ timeout: 10000 });
    await expect(analyzeButton).toBeEnabled();
  });

  test("debe permitir submit con Enter cuando URL es válida", async ({ page }) => {
    const input = page.getByPlaceholder("https://github.com/owner/repo");

    await input.fill("https://github.com/facebook/react");
    await expect(page.getByText("✓ Valid GitHub repository")).toBeVisible({ timeout: 10000 });

    // Presionar Enter debería iniciar análisis (mostrar loading)
    await input.press("Enter");

    await expect(page.getByText(/Analyzing/i)).toBeVisible({ timeout: 5000 });
  });
});
