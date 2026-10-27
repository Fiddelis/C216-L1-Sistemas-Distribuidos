import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("cadastra, edita e remove um jogo", async ({ page }) => {
  await page
    .getByRole("button", { name: "Adicionar jogo", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Título", { exact: true })
    .fill("Jogo de verificação");
  await dialog.getByLabel("Gênero", { exact: true }).selectOption("RPG");
  await dialog.getByLabel("Plataforma", { exact: true }).selectOption("PC");
  await dialog.getByLabel("Ano de lançamento").fill("2026");
  await dialog.getByLabel("Preço (R$)", { exact: true }).fill("79.90");
  await dialog
    .getByRole("button", { name: "Adicionar jogo", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(7);
  await expect(page.getByRole("status")).toContainText("Jogo adicionado");
  await page
    .getByRole("button", { name: "Editar Jogo de verificação" })
    .click();
  await dialog.getByLabel("Título", { exact: true }).fill("Jogo editado");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(
    page.getByRole("heading", { name: "Jogo editado", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Excluir Jogo editado" }).click();
  await dialog.getByRole("button", { name: "Manter jogo" }).click();
  await expect(page.getByRole("article")).toHaveCount(7);
  await page.getByRole("button", { name: "Excluir Jogo editado" }).click();
  await dialog.getByRole("button", { name: "Sim, remover jogo" }).click();
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("combina busca e filtros e trata busca sem resultados", async ({
  page,
}) => {
  await page.getByLabel("Buscar jogos").fill("CRISTAL");
  await page.getByLabel("Filtrar por gênero").selectOption("Aventura");
  await page.getByLabel("Filtrar por plataforma").selectOption("PC");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByLabel("Buscar jogos").fill("inexistente");
  await expect(
    page.getByRole("heading", { name: "Nenhum jogo por aqui." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros" }).first().click();
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("valida campos e fecha o diálogo com Escape", async ({ page }) => {
  await page
    .getByRole("button", { name: "Adicionar jogo", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Adicionar jogo" })
    .click();
  await expect(page.getByText("O título é obrigatório.")).toBeVisible();
  await expect(page.getByLabel("Título", { exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(6);
});

test("ordena por preço e mantém a página sem rolagem horizontal", async ({
  page,
}) => {
  await page.getByLabel("Ordenar por").selectOption("preco");
  await expect(
    page
      .getByRole("article")
      .first()
      .getByRole("heading", { name: "Cavernas de Cristal" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  expect(overflow).toBe(false);
});

test("reinicia alterações ao recarregar, sem chamar a API", async ({
  page,
}) => {
  const apiCalls = [];
  page.on("request", (request) => {
    if (new URL(request.url()).port === "8000") apiCalls.push(request.url());
  });
  await page.getByRole("button", { name: "Excluir Ilhas Perdidas" }).click();
  await page.getByRole("button", { name: "Sim, remover jogo" }).click();
  await expect(page.getByRole("article")).toHaveCount(5);
  await page.reload();
  await expect(page.getByRole("article")).toHaveCount(6);
  expect(apiCalls).toEqual([]);
});
