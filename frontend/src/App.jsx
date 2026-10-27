import {
  Check,
  Gamepad2,
  Library,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useReducer, useState } from "react";
import GameCard from "./components/GameCard.jsx";
import GameForm from "./components/GameForm.jsx";
import Modal from "./components/Modal.jsx";
import { sampleGames } from "./data/games.js";
import { createLibrary, filterGames, libraryReducer } from "./lib/games.js";

export default function App() {
  const [library, dispatch] = useReducer(
    libraryReducer,
    sampleGames,
    createLibrary,
  );
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [sort, setSort] = useState("recentes");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  const games = filterGames(library.games, { search, genre, platform, sort });
  const uniqueGenres = [
    ...new Set(library.games.map((game) => game.genero)),
  ].sort();
  const uniquePlatforms = [
    ...new Set(library.games.map((game) => game.plataforma)),
  ].sort();
  const filtered = !!(search || genre || platform);
  function resetFilters() {
    setSearch("");
    setGenre("");
    setPlatform("");
  }
  function save(game) {
    dispatch({ type: "save", game, id: editor.game?.id });
    setNotice(
      editor.game ? "Alterações salvas." : "Jogo adicionado à biblioteca.",
    );
    resetFilters();
    setEditor(null);
  }
  function remove() {
    dispatch({ type: "remove", id: deleting.id });
    setNotice(`“${deleting.titulo}” foi removido da biblioteca.`);
    setDeleting(null);
    // Um filtro de categoria removida não deve ficar oculto no select.
    setGenre("");
    setPlatform("");
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#catalogo">
        Ir para o catálogo
      </a>
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            checkpoint<span className="brand-period">.</span>
          </span>
        </div>
        <div className="header-section">
          <Library size={16} />
          <span>Minha biblioteca</span>
        </div>
      </header>
      <main>
        <section className="hero" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">
              <span className="tiny-line" /> UM ESPAÇO PARA OS SEUS FAVORITOS
            </p>
            <h1 id="page-title">
              Biblioteca <span className="heading-accent">de jogos.</span>
            </h1>
            <p className="hero-description">
              Organize sua coleção, descubra o que vem a seguir.
              <br className="desktop-break" /> Cada título merece um lugar aqui.
            </p>
          </div>
          <div className="collection-summary">
            <div className="summary-decoration" aria-hidden="true">
              <Gamepad2 size={104} strokeWidth={1} />
            </div>
            <span className="summary-label">SUA COLEÇÃO</span>
            <div className="summary-number">
              {String(library.games.length).padStart(2, "0")}
              <span>jogos no catálogo</span>
            </div>
            <div className="summary-footer">
              <span>{uniqueGenres.length} gêneros</span>
              <span className="summary-dot">·</span>
              <span>{uniquePlatforms.length} plataformas</span>
              <span className="summary-mini" aria-hidden="true">
                ↗
              </span>
            </div>
          </div>
        </section>
        <section
          id="catalogo"
          className="catalog-section"
          aria-labelledby="catalog-title"
        >
          <div className="section-heading">
            <div className="flex items-center gap-3">
              <h2 id="catalog-title">Sua coleção</h2>
              <span className="count-badge">{library.games.length}</span>
            </div>
            <button
              className="button primary"
              type="button"
              onClick={() => setEditor({ game: null })}
            >
              <Plus size={18} />
              Adicionar jogo
            </button>
          </div>
          <div className="filter-bar">
            <div className="search-field">
              <Search size={18} />
              <input
                aria-label="Buscar jogos"
                placeholder="Buscar pelo título do jogo..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Limpar busca"
                  onClick={() => setSearch("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="filter-control">
              <SlidersHorizontal size={15} />
              <select
                aria-label="Filtrar por gênero"
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
              >
                <option value="">Todos os gêneros</option>
                {uniqueGenres.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div className="filter-control">
              <select
                aria-label="Filtrar por plataforma"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
              >
                <option value="">Todas as plataformas</option>
                {uniquePlatforms.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="results-bar">
            <div>
              <span>
                {games.length}{" "}
                {games.length === 1 ? "jogo encontrado" : "jogos encontrados"}
              </span>
              {filtered && (
                <button
                  className="text-button"
                  type="button"
                  onClick={resetFilters}
                >
                  Limpar filtros
                </button>
              )}
            </div>
            <div className="sort-control">
              <label htmlFor="sort">Ordenar por</label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="recentes">Adicionados recentemente</option>
                <option value="titulo">Título: A a Z</option>
                <option value="preco">Menor preço</option>
              </select>
            </div>
          </div>
          {games.length ? (
            <div className="games-grid">
              {games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onEdit={(selected) => setEditor({ game: selected })}
                  onDelete={setDeleting}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Search size={26} />
              </span>
              <h3>
                {filtered
                  ? "Nenhum jogo por aqui."
                  : "Sua próxima coleção começa aqui."}
              </h3>
              <p>
                {filtered
                  ? "Tente outro título ou ajuste os filtros da busca."
                  : "Adicione seu primeiro jogo para montar a biblioteca."}
              </p>
              <button
                type="button"
                className="button secondary"
                onClick={
                  filtered ? resetFilters : () => setEditor({ game: null })
                }
              >
                {filtered ? "Limpar filtros" : "Adicionar primeiro jogo"}
              </button>
            </div>
          )}
          <div className="notice" role="status">
            {notice && (
              <>
                <Check size={17} />
                <span>{notice}</span>
                <button
                  className="icon-button"
                  type="button"
                  aria-label="Fechar aviso"
                  onClick={() => setNotice("")}
                >
                  <X size={16} />
                </button>
              </>
            )}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span className="footer-brand">checkpoint.</span>
        <p>Seu próximo jogo começa com uma boa escolha.</p>
        <span>Dados reiniciam ao recarregar</span>
      </footer>
      {editor && (
        <Modal
          title={editor.game ? "Editar jogo" : "Um novo jogo na coleção."}
          subtitle={
            editor.game ? "ATUALIZE SUA BIBLIOTECA" : "PRÓXIMA AVENTURA"
          }
          onClose={() => setEditor(null)}
        >
          <GameForm
            game={editor.game}
            onSave={save}
            onCancel={() => setEditor(null)}
          />
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Remover este jogo?"
          subtitle="SUA BIBLIOTECA"
          onClose={() => setDeleting(null)}
        >
          <p className="delete-description">
            O jogo <strong>{deleting.titulo}</strong> será removido da coleção
            desta sessão.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              type="button"
              onClick={() => setDeleting(null)}
            >
              Manter jogo
            </button>
            <button className="button danger" type="button" onClick={remove}>
              Sim, remover jogo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
