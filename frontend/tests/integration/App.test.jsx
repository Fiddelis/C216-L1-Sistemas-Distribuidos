import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App.jsx";

describe("catálogo", () => {
  it("renderiza e filtra jogos por título", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getAllByRole("article")).toHaveLength(6);
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
    await user.type(screen.getByLabelText("Buscar jogos"), "jogo inexistente");
    expect(
      screen.getByRole("heading", { name: "Nenhum jogo por aqui." }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });
  it("valida, cadastra, edita e exclui um jogo", async () => {
    const user = userEvent.setup();
    render(<App />);
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
    expect(screen.getAllByRole("article")).toHaveLength(7);
    expect(screen.getByRole("status")).toHaveTextContent("Jogo adicionado");
    await user.click(
      screen.getByRole("button", { name: "Editar Teste da biblioteca" }),
    );
    await user.clear(screen.getByLabelText("Título"));
    await user.type(screen.getByLabelText("Título"), "Título editado");
    await user.click(screen.getByRole("button", { name: "Salvar alterações" }));
    expect(
      screen.getByRole("heading", { name: "Título editado" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Excluir Título editado" }),
    );
    await user.click(screen.getByRole("button", { name: "Manter jogo" }));
    expect(screen.getAllByRole("article")).toHaveLength(7);
    await user.click(
      screen.getByRole("button", { name: "Excluir Título editado" }),
    );
    await user.click(screen.getByRole("button", { name: "Sim, remover jogo" }));
    expect(screen.getAllByRole("article")).toHaveLength(6);
    expect(
      screen.queryByRole("heading", { name: "Título editado" }),
    ).not.toBeInTheDocument();
  });
  it("fecha o formulário sem criar registros", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Adicionar jogo" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });
});
