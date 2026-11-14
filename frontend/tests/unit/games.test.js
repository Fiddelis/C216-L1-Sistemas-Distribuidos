import { describe, expect, it } from "vitest";
import { sampleGames } from "../../src/data/games.js";
import {
  currency,
  filterGames,
  normalizeGame,
  validateGame,
} from "../../src/lib/games.js";

const valid = {
  titulo: "Novo jogo",
  genero: "RPG",
  plataforma: "PC",
  ano: "2026",
  preco: "59.90",
};

describe("validação", () => {
  it("aceita o contrato de jogo", () => {
    expect(validateGame(valid)).toEqual({});
  });
  it.each([
    ["titulo", ""],
    ["titulo", " ".repeat(3)],
    ["titulo", "a".repeat(51)],
    ["genero", ""],
    ["genero", "a".repeat(51)],
    ["plataforma", ""],
    ["plataforma", "a".repeat(31)],
    ["ano", ""],
    ["ano", 1957],
    ["ano", 2101],
    ["ano", 2020.5],
    ["preco", ""],
    ["preco", 0],
    ["preco", -1],
    ["preco", "Infinity"],
    ["preco", "abc"],
  ])("rejeita %s = %s", (field, value) => {
    expect(validateGame({ ...valid, [field]: value })[field]).toBeTruthy();
  });
  it("aceita os limites do ano", () => {
    expect(validateGame({ ...valid, ano: 1958 })).toEqual({});
    expect(validateGame({ ...valid, ano: 2100 })).toEqual({});
  });
  it("normaliza números e espaços", () => {
    expect(normalizeGame({ ...valid, titulo: " Novo jogo " })).toEqual({
      ...valid,
      titulo: "Novo jogo",
      ano: 2026,
      preco: 59.9,
    });
  });
});

describe("busca, filtros e ordenação", () => {
  it("busca sem diferenciar acentos e maiúsculas", () => {
    expect(
      filterGames(sampleGames, { search: "ORBITA" }).map((game) => game.titulo),
    ).toEqual(["Órbita Zero"]);
  });
  it("combina título, gênero e plataforma", () => {
    expect(
      filterGames(sampleGames, {
        search: "cristal",
        genre: "Aventura",
        platform: "PC",
      }),
    ).toHaveLength(1);
  });
  it("retorna vazio quando os filtros não coincidem", () => {
    expect(
      filterGames(sampleGames, { genre: "Aventura", platform: "Xbox" }),
    ).toEqual([]);
  });
  it("ordena por preço sem alterar a origem", () => {
    const before = structuredClone(sampleGames);
    const sorted = filterGames(sampleGames, { sort: "preco" });
    expect(sorted[0].titulo).toBe("Cavernas de Cristal");
    expect(sampleGames).toEqual(before);
  });
  it("ordena por título", () => {
    expect(filterGames(sampleGames, { sort: "titulo" })[0].titulo).toBe(
      "Cavernas de Cristal",
    );
  });
  it("ordena por ID recente por padrão", () => {
    expect(filterGames(sampleGames)[0].id).toBe(6);
  });
  it("formata BRL", () => {
    expect(currency(49.9).replace(/\s/g, " ")).toBe("R$ 49,90");
  });
});
