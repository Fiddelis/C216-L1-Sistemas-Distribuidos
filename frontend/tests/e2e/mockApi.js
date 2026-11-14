import { sampleGames } from "../../src/data/games.js";

const API_ORIGIN = "http://127.0.0.1:8000";

export async function installApiMock(page, initialGames = sampleGames) {
  let games = initialGames.map((game) => ({ ...game }));
  let nextId = Math.max(0, ...games.map((game) => game.id)) + 1;

  await page.route(`${API_ORIGIN}/games**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const match = url.pathname.match(/^\/games(?:\/(\d+))?$/);
    if (!match) {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ detail: "Não encontrado" }),
      });
      return;
    }

    const id = match[1] ? Number(match[1]) : null;

    if (method === "GET" && id == null) {
      const limite = Number(url.searchParams.get("limite") ?? 10);
      const genero = url.searchParams.get("genero");
      let result = [...games];
      if (genero) {
        const needle = genero.toLocaleLowerCase("pt-BR");
        result = result.filter(
          (game) => game.genero.toLocaleLowerCase("pt-BR") === needle,
        );
      }
      result = result.slice(0, limite);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(result),
      });
      return;
    }

    if (method === "GET" && id != null) {
      const game = games.find((item) => item.id === id);
      if (!game) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Jogo não encontrado" }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(game),
      });
      return;
    }

    if (method === "POST" && id == null) {
      const body = request.postDataJSON();
      const created = { ...body, id: nextId++ };
      games = [...games, created];
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(created),
      });
      return;
    }

    if (method === "PUT" && id != null) {
      const index = games.findIndex((item) => item.id === id);
      if (index < 0) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Jogo não encontrado" }),
        });
        return;
      }
      const updated = { ...request.postDataJSON(), id };
      games = games.map((item) => (item.id === id ? updated : item));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(updated),
      });
      return;
    }

    if (method === "PATCH" && id != null) {
      const index = games.findIndex((item) => item.id === id);
      if (index < 0) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Jogo não encontrado" }),
        });
        return;
      }
      const patch = request.postDataJSON();
      const updated = {
        ...games[index],
        ...Object.fromEntries(
          Object.entries(patch).filter(([, value]) => value != null),
        ),
      };
      games = games.map((item) => (item.id === id ? updated : item));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(updated),
      });
      return;
    }

    if (method === "DELETE" && id != null) {
      if (!games.some((item) => item.id === id)) {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Jogo não encontrado" }),
        });
        return;
      }
      games = games.filter((item) => item.id !== id);
      await route.fulfill({ status: 204, body: "" });
      return;
    }

    await route.fulfill({
      status: 405,
      contentType: "application/json",
      body: JSON.stringify({ detail: "Método não permitido" }),
    });
  });
}
