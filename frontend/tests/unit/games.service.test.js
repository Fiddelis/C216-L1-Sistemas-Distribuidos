import { afterEach, describe, expect, it, vi } from "vitest";
import * as api from "../../src/services/api.js";
import {
  createGame,
  deleteGame,
  getGame,
  listGames,
  replaceGame,
  updateGame,
} from "../../src/services/games.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("games service", () => {
  it("lista com limite padrão", async () => {
    const spy = vi.spyOn(api, "request").mockResolvedValue([]);
    await listGames();
    expect(spy).toHaveBeenCalledWith("/games?limite=100");
  });

  it("consulta, cria, substitui, atualiza e remove", async () => {
    const spy = vi.spyOn(api, "request").mockResolvedValue({ id: 1 });
    const payload = {
      titulo: "Jogo",
      genero: "RPG",
      plataforma: "PC",
      ano: 2026,
      preco: 10,
    };
    await getGame(1);
    await createGame(payload);
    await replaceGame(1, payload);
    await updateGame(1, { preco: 20 });
    await deleteGame(1);
    expect(spy.mock.calls).toEqual([
      ["/games/1"],
      ["/games", { method: "POST", body: JSON.stringify(payload) }],
      ["/games/1", { method: "PUT", body: JSON.stringify(payload) }],
      ["/games/1", { method: "PATCH", body: JSON.stringify({ preco: 20 }) }],
      ["/games/1", { method: "DELETE" }],
    ]);
  });
});
