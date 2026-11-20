import { expect, type Page, test } from "@playwright/test";

const API = process.env.VITE_API_URL ?? "http://127.0.0.1:8000";

async function loginAs(page: Page, actorId: string) {
  await page.getByTestId(`login-${actorId}`).click();
}

test.describe("helpdesk live API", () => {
  test.beforeAll(async ({ request }) => {
    const actors = await request.get(`${API}/actors`);
    if (!actors.ok()) {
      test.skip(
        true,
        "API não disponível — suba Compose/backend antes do E2E live",
      );
    }
  });

  test("aluno cria ticket e outro aluno não vê", async ({ page, request }) => {
    const title = `E2E ${Date.now()}`;

    await page.goto("/");
    await loginAs(page, "stu-ana");

    await page
      .getByPlaceholder("O que está acontecendo?")
      .fill("Criado pelo Playwright");
    await page.getByPlaceholder("O que está acontecendo?").press("Enter");
    await page.getByPlaceholder("Resumo curto do chamado").fill(title);
    await page.getByRole("button", { name: "Salvar" }).click();

    await expect(page.getByText(title)).toBeVisible();

    await page.getByRole("button", { name: "Trocar usuário" }).click();
    await loginAs(page, "stu-bruno");
    await expect(page.getByText(title)).toHaveCount(0);

    const list = await request.get(`${API}/tickets`, {
      headers: { "X-Actor-Id": "stu-ana" },
    });
    expect(list.ok()).toBeTruthy();
    const rows = await list.json();
    expect(
      rows.some((row: { title: string }) => row.title === title),
    ).toBeTruthy();
  });
});
