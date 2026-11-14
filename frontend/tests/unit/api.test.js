import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "../../src/services/api.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("request", () => {
  it("retorna JSON em sucesso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ id: 1, titulo: "Jogo" }),
      }),
    );
    await expect(request("/games/1")).resolves.toEqual({
      id: 1,
      titulo: "Jogo",
    });
  });

  it("trata falha de rede", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("failed")));
    await expect(request("/games")).rejects.toMatchObject({
      message: "Não foi possível conectar à API.",
      kind: "network",
    });
  });

  it("trata resposta HTTP de erro com detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ detail: "Jogo não encontrado" }),
      }),
    );
    await expect(request("/games/99")).rejects.toBeInstanceOf(ApiError);
    await expect(request("/games/99")).rejects.toMatchObject({
      message: "Jogo não encontrado",
      status: 404,
      kind: "http",
    });
  });

  it("retorna null em 204", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        text: async () => "",
      }),
    );
    await expect(request("/games/1", { method: "DELETE" })).resolves.toBeNull();
  });
});
