import { expect, test } from "@playwright/test";

test.describe("Grupos da fila de atendimentos", () => {
  test("separa conversas entre atendendo, aguardando e resolvidos", async ({ page }) => {
    await page.goto("/atendimentos");

    const queue = page.locator("[data-queue-panel]");
    await expect(page.getByRole("navigation", { name: "Grupos de atendimento" })).toBeVisible();
    await expect(queue.getByText("Maria Oliveira")).toBeVisible();

    await page.getByRole("button", { name: /^Atendendo,/ }).click();
    await expect(queue.getByText("Carlos Eduardo Santos")).toBeVisible();
    await expect(queue.getByText("Maria Oliveira")).toHaveCount(0);

    await page.getByRole("button", { name: /^Resolvidos,/ }).click();
    await expect(queue.getByText("Rafael Monteiro")).toBeVisible();
    await expect(page.getByText("Resolvido pela IA").first()).toBeVisible();
  });

  test("mantém os três grupos acessíveis no layout compacto", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 760 });
    await page.goto("/atendimentos");

    const navigation = page.getByRole("navigation", { name: "Grupos de atendimento" });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("button", { name: /^Atendendo,/ })).toBeVisible();
    await expect(navigation.getByRole("button", { name: /^Aguardando,/ })).toBeVisible();
    await expect(navigation.getByRole("button", { name: /^Resolvidos,/ })).toBeVisible();

    await navigation.getByRole("button", { name: /^Resolvidos,/ }).click();
    await expect(page.locator("[data-queue-panel]").getByText("Rafael Monteiro")).toBeVisible();
  });

  test("só expande os filtros da fila após solicitar", async ({ page }) => {
    await page.goto("/atendimentos");

    const filtersButton = page.getByRole("button", { name: "Filtros" });
    const filtersPanel = page.locator("#attendance-filters");
    await expect(filtersButton).toHaveAttribute("aria-expanded", "false");
    await expect(filtersPanel).toHaveAttribute("aria-hidden", "true");

    await filtersButton.click();
    await expect(filtersButton).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText("Filtros da fila")).toBeVisible();
    await expect(page.getByLabel("Canal")).toBeVisible();
  });
});
