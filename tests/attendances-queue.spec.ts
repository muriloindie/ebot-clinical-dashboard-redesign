import { expect, test } from "@playwright/test";

test.describe("Grupos da fila de atendimentos", () => {
  test("separa conversas entre atendendo, aguardando e resolvidos", async ({ page }) => {
    await page.goto("/atendimentos");

    const queue = page.locator("[data-queue-panel]");
    await expect(page.getByRole("navigation", { name: "Grupos de atendimento" })).toBeVisible();
    await expect(queue.getByText("Maria Oliveira")).toBeVisible();

    await page.getByRole("button", { name: /^Atendendo,/ }).click();
    await queue.getByRole("button", { name: /^Cardiologia,/ }).click();
    await expect(queue.getByText("Carlos Eduardo Santos")).toBeVisible();
    await expect(queue.getByText("Maria Oliveira")).toHaveCount(0);

    await page.getByRole("button", { name: /^Resolvidos,/ }).click();
    await queue.getByRole("button", { name: /^Atendimento,/ }).click();
    await expect(queue.getByText("Rafael Monteiro")).toBeVisible();
    await expect(page.getByText("Resolvido pela IA").first()).toBeVisible();
  });

  test("mantém os quatro grupos acessíveis no layout compacto", async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 760 });
    await page.goto("/atendimentos");

    const navigation = page.getByRole("navigation", { name: "Grupos de atendimento" });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("button", { name: /^Atendendo,/ })).toBeVisible();
    await expect(navigation.getByRole("button", { name: /^Aguardando,/ })).toBeVisible();
    await expect(navigation.getByRole("button", { name: /^Resolvidos,/ })).toBeVisible();
    await expect(navigation.getByRole("button", { name: /^Grupos,/ })).toBeVisible();

    await navigation.getByRole("button", { name: /^Resolvidos,/ }).click();
    await expect(page.locator("[data-queue-panel]").getByText("Lucas Pereira")).toBeVisible();
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

  test("agrupa atendimentos por setor criado em cada grupo da fila", async ({ page }) => {
    await page.goto("/atendimentos");

    const queue = page.locator("[data-queue-panel]");
    await expect(queue.getByRole("button", { name: /^Atendimento, 3 atendimentos$/ })).toBeVisible();
    await expect(queue.getByRole("button", { name: /^Exames, 1 atendimento$/ })).toBeVisible();
    await expect(queue.getByRole("button", { name: /^Financeiro, 1 atendimento$/ })).toBeVisible();

    await page.getByRole("button", { name: /^Atendendo,/ }).click();
    await expect(queue.getByRole("button", { name: /^Atendimentos sem setor, 1 atendimento$/ })).toBeVisible();
    await expect(queue.getByRole("button", { name: /^Cardiologia, 1 atendimento$/ })).toBeVisible();
    await expect(queue.getByRole("button", { name: /^Dermatologia, 0 atendimentos$/ })).toBeVisible();
  });

  test("no grupo Grupos mostra todos os setores com counters e abre/recolhe com animação", async ({ page }) => {
    await page.goto("/atendimentos");

    const queue = page.locator("[data-queue-panel]");
    await page.getByRole("button", { name: /^Grupos,/ }).click();
    await expect(queue.getByText("10 atendimentos em todos os grupos")).toBeVisible();

    const semSetor = queue.getByRole("button", { name: /^Atendimentos sem setor, 1 atendimento$/ });
    const financeiro = queue.getByRole("button", { name: /^Financeiro, 1 atendimento$/ });
    await expect(semSetor).toBeVisible();
    await expect(financeiro).toBeVisible();
    await expect(queue.getByRole("button", { name: /^Cardiologia, 1 atendimento$/ })).toBeVisible();
    await expect(queue.getByRole("button", { name: /^Dermatologia, 0 atendimentos$/ })).toBeVisible();

    // O setor da conversa selecionada abre por padrão.
    await expect(queue.getByText("Amanda Souza")).toBeVisible();

    await expect(financeiro).toHaveAttribute("aria-expanded", "false");
    await financeiro.click();
    await expect(financeiro).toHaveAttribute("aria-expanded", "true");
    await expect(queue.getByText("Camila Rodrigues")).toBeVisible();

    await financeiro.click();
    await expect(financeiro).toHaveAttribute("aria-expanded", "false");
    await expect(queue.getByText("Camila Rodrigues")).toBeHidden();

    // Sem setor guarda conversas sem setor atribuído, em qualquer status.
    await semSetor.click();
    await expect(queue.getByText("José Ricardo Alves")).toBeVisible();
  });
});
