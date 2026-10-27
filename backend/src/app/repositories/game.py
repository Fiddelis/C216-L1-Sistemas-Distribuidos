from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.game import Game


class GameRepository:
    def __init__(self, session: Session):
        self.session = session

    def listar(self, genero: str | None = None, limite: int = 10) -> list[Game]:
        query = select(Game).order_by(Game.id).limit(limite)
        if genero is not None:
            query = query.where(func.lower(Game.genero) == genero.lower())
        return list(self.session.scalars(query))

    def obter(self, game_id: int) -> Game | None:
        return self.session.get(Game, game_id)

    def salvar(self, jogo: Game) -> Game:
        self.session.add(jogo)
        self.session.commit()
        self.session.refresh(jogo)
        return jogo

    def remover(self, jogo: Game) -> None:
        self.session.delete(jogo)
        self.session.commit()
