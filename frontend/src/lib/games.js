export function validateGame(values) {
  const errors = {};
  for (const [key, label, max] of [
    ["titulo", "O título", 50],
    ["genero", "O gênero", 50],
    ["plataforma", "A plataforma", 30],
  ]) {
    const text = String(values[key] ?? "").trim();
    if (!text) errors[key] = `${label} é obrigatório.`;
    else if (text.length > max)
      errors[key] = `${label} deve ter até ${max} caracteres.`;
  }
  const ano = Number(values.ano);
  if (!Number.isInteger(ano) || ano < 1958 || ano > 2100) {
    errors.ano = "Informe um ano inteiro entre 1958 e 2100.";
  }
  if (!Number.isFinite(Number(values.preco)) || Number(values.preco) <= 0) {
    errors.preco = "Informe um preço maior que zero.";
  }
  return errors;
}

export function normalizeGame(values) {
  return {
    titulo: values.titulo.trim(),
    genero: values.genero.trim(),
    plataforma: values.plataforma.trim(),
    ano: Number(values.ano),
    preco: Number(values.preco),
  };
}

export function filterGames(
  games,
  { search = "", genre = "", platform = "", sort = "recentes" } = {},
) {
  const normalized = (text) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR");
  const term = normalized(search.trim());
  const result = games.filter(
    (game) =>
      (!term || normalized(game.titulo).includes(term)) &&
      (!genre || game.genero === genre) &&
      (!platform || game.plataforma === platform),
  );
  return result.sort((a, b) => {
    if (sort === "titulo") return a.titulo.localeCompare(b.titulo, "pt-BR");
    if (sort === "preco") return a.preco - b.preco;
    return b.id - a.id;
  });
}

export const currency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export function createLibrary(games) {
  return {
    games: games.map((game) => ({ ...game })),
    nextId: Math.max(0, ...games.map((game) => game.id)) + 1,
  };
}

export function libraryReducer(state, action) {
  if (action.type === "save") {
    if (action.id != null) {
      return {
        ...state,
        games: state.games.map((game) =>
          game.id === action.id ? { ...action.game, id: game.id } : game,
        ),
      };
    }
    return {
      games: [...state.games, { ...action.game, id: state.nextId }],
      nextId: state.nextId + 1,
    };
  }
  if (action.type === "remove")
    return {
      ...state,
      games: state.games.filter((game) => game.id !== action.id),
    };
  return state;
}
