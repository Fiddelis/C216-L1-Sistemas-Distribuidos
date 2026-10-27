import { ArrowUpRight, Monitor, Pencil, Trash2 } from "lucide-react";
import { currency } from "../lib/games.js";

const colors = {
  Aventura: "adventure",
  RPG: "rpg",
  Corrida: "racing",
  Estratégia: "strategy",
  Simulação: "simulation",
};

export default function GameCard({ game, onEdit, onDelete }) {
  return (
    <article className="game-card">
      <div
        className={`game-art ${colors[game.genero] ?? "other"}`}
        aria-hidden="true"
      >
        <div className="art-grain" />
        <div className="art-orbit" />
        <div className="art-sun" />
        <div className="art-landscape" />
        <span className="art-caption">{game.genero}</span>
        <span className="art-number">{String(game.id).padStart(2, "0")}</span>
        <span className="art-title">{game.titulo}</span>
        <ArrowUpRight className="art-arrow" size={20} />
      </div>
      <div className="card-content">
        <div className="card-meta">
          <span>{game.genero}</span>
          <span>{game.ano}</span>
        </div>
        <h3>{game.titulo}</h3>
        <div className="platform">
          <Monitor size={13} />
          <span>{game.plataforma}</span>
        </div>
        <div className="card-bottom">
          <span className="price">{currency(game.preco)}</span>
          <div className="card-actions">
            <button
              className="icon-button"
              type="button"
              onClick={() => onEdit(game)}
              aria-label={`Editar ${game.titulo}`}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-button delete-button"
              type="button"
              onClick={() => onDelete(game)}
              aria-label={`Excluir ${game.titulo}`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
