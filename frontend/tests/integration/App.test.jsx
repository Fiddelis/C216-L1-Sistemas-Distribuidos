import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App.jsx";
import { sampleGames } from "../../src/data/games.js";
import * as gamesService from "../../src/services/games.js";

function seed(games = sampleGames) {
  let store = games.map((game) => ({ ...game }));
  let nextId = Math.max(0, ...store.map((game) => game.id)) + 1;
  vi.spyOn(gamesService, "listGames").mockImplementation(async () =>
    store.map((game) => ({ ...game })),
  );
  vi.spyOn(gamesService, "createGame").mockImplementation(async (data) => {
    const created = { ...data, id: nextId++ };
    store = [...store, created];
    return created;
  });
  vi.spyOn(gamesService, "replaceGame").mockImplementation(async (id, data) => {
    const updated = { ...data, id };
    store = store.map((game) => (game.id === id ? updated : game));
    return updated;
  });
  vi.spyOn(gamesService, "deleteGame").mockImplementation(async (id) => {
    store = store.filter((game) => game.id !== id);
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
  seed();
});

describe("catálogo integrado à API", () => {
  it("renderiza e filtra jogos por título", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
    await user.type(
      screen.getByRole("textbox", { name: "Buscar jogos" }),
      "orbita",
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(
      screen.getByRole("heading", { name: "Órbita Zero" }),
    ).toBeInTheDocument();
  });

  it("combina filtros e permite limpar", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
    await user.selectOptions(
      screen.getByLabelText("Filtrar por gênero"),
      "Aventura",
    );
    await user.selectOptions(
      screen.getByLabelText("Filtrar por plataforma"),
      "Switch",
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });

  it("exibe estado vazio e limpa a busca", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
    await user.type(screen.getByLabelText("Buscar jogos"), "jogo inexistente");
    expect(
      screen.getByRole("heading", { name: "Nenhum jogo por aqui." }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });

  it("valida, cadastra, edita e exclui um jogo via API", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
    await user.click(screen.getByRole("button", { name: "Adicionar jogo" }));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Adicionar jogo" }),
    );
    expect(screen.getByText("O título é obrigatório.")).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toHaveFocus();
    await user.type(screen.getByLabelText("Título"), "Teste da biblioteca");
    await user.selectOptions(screen.getByLabelText("Gênero"), "RPG");
    await user.selectOptions(screen.getByLabelText("Plataforma"), "PC");
    await user.type(screen.getByLabelText("Ano de lançamento"), "2026");
    await user.type(screen.getByLabelText("Preço (R$)"), "99.90");
    await user.click(
      within(dialog).getByRole("button", { name: "Adicionar jogo" }),
    );
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(7));
    expect(screen.getByRole("status")).toHaveTextContent("Jogo adicionado");
    expect(gamesService.createGame).toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: "Editar Teste da biblioteca" }),
    );
    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Título editado");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Título editado" }),
      ).toBeInTheDocument(),
    );
    expect(gamesService.replaceGame).toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: "Excluir Título editado" }),
    );
    await user.click(screen.getByRole("button", { name: "Manter jogo" }));
    expect(screen.getAllByRole("article")).toHaveLength(7);
    await user.click(
      screen.getByRole("button", { name: "Excluir Título editado" }),
    );
    await user.click(screen.getByRole("button", { name: "Sim, remover jogo" }));
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
    expect(gamesService.deleteGame).toHaveBeenCalled();
    expect(
      screen.queryByRole("heading", { name: "Título editado" }),
    ).not.toBeInTheDocument();
  });

  it("mostra erro quando a API está inacessível", async () => {
    vi.spyOn(gamesService, "listGames").mockRejectedValue(
      new Error("Não foi possível conectar à API."),
    );
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Não foi possível conectar à API.",
      ),
    );
  });

  it("fecha o formulário sem criar registros", async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitFor(() => expect(screen.getAllByRole("article")).toHaveLength(6));
    await user.click(screen.getByRole("button", { name: "Adicionar jogo" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(gamesService.createGame).not.toHaveBeenCalled();
  });
});
