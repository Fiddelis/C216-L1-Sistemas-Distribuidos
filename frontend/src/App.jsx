import {
  AlertCircle,
  Check,
  Gamepad2,
  Library,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import GameCard from "./components/GameCard.jsx";
import GameForm from "./components/GameForm.jsx";
import Modal from "./components/Modal.jsx";
import { filterGames } from "./lib/games.js";
import {
  createGame,
  deleteGame,
  listGames,
  replaceGame,
} from "./services/games.js";

export default function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [sort, setSort] = useState("recentes");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const visible = filterGames(games, { search, genre, platform, sort });
  const uniqueGenres = [...new Set(games.map((game) => game.genero))].sort();
  const uniquePlatforms = [
    ...new Set(games.map((game) => game.plataforma)),
  ].sort();
  const filtered = !!(search || genre || platform);

  async function refreshGames() {
    const data = await listGames();
    setGames(data);
    return data;
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await listGames();
        if (active) setGames(data);
      } catch (err) {
        if (active) {
          setGames([]);
          setError(err.message || "Não foi possível carregar os jogos.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function resetFilters() {
    setSearch("");
    setGenre("");
    setPlatform("");
  }

  async function save(game) {
    setBusy(true);
    setError("");
    try {
      if (editor.game?.id != null) {
        await replaceGame(editor.game.id, game);
        setNotice("Alterações salvas.");
      } else {
        await createGame(game);
        setNotice("Jogo adicionado à biblioteca.");
      }
      await refreshGames();
      resetFilters();
      setEditor(null);
    } catch (err) {
      setError(err.message || "Não foi possível salvar o jogo.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await deleteGame(deleting.id);
      setNotice(`“${deleting.titulo}” foi removido da biblioteca.`);
      setDeleting(null);
      setGenre("");
      setPlatform("");
      await refreshGames();
    } catch (err) {
      setError(err.message || "Não foi possível remover o jogo.");
    } finally {
      setBusy(false);
    }
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
              {String(games.length).padStart(2, "0")}
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
              <span className="count-badge">{games.length}</span>
            </div>
            <button
              className="button primary"
              type="button"
              disabled={busy || loading}
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
                {visible.length}{" "}
                {visible.length === 1 ? "jogo encontrado" : "jogos encontrados"}
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
          {loading ? (
            <div className="empty-state" role="status">
              <h3>Carregando biblioteca...</h3>
              <p>Buscando os jogos na API.</p>
            </div>
          ) : visible.length ? (
            <div className="games-grid">
              {visible.map((game) => (
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
          {error && (
            <div className="notice notice-error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
              <button
                className="icon-button"
                type="button"
                aria-label="Fechar erro"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
        </section>
      </main>
      <footer className="site-footer">
        <span className="footer-brand">checkpoint.</span>
        <p>Seu próximo jogo começa com uma boa escolha.</p>
        <span>Dados sincronizados com a API</span>
      </footer>
      {editor && (
        <Modal
          title={editor.game ? "Editar jogo" : "Um novo jogo na coleção."}
          subtitle={
            editor.game ? "ATUALIZE SUA BIBLIOTECA" : "PRÓXIMA AVENTURA"
          }
          onClose={() => !busy && setEditor(null)}
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
          onClose={() => !busy && setDeleting(null)}
        >
          <p className="delete-description">
            O jogo <strong>{deleting.titulo}</strong> será removido da coleção.
          </p>
          <div className="modal-actions">
            <button
              className="button secondary"
              type="button"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Manter jogo
            </button>
            <button
              className="button danger"
              type="button"
              disabled={busy}
              onClick={remove}
            >
              Sim, remover jogo
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
