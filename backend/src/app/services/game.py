from app.models.game import Game
from app.repositories.game import GameRepository
from app.schemas.game import GameCreate, GamePatch, GameUpdate


class GameNotFound(LookupError):
    pass


class GameService:
    def __init__(self, repository: GameRepository):
        self.repository = repository

    def listar_jogos(self, genero: str | None = None, limite: int = 10) -> list[Game]:
        return self.repository.listar(genero, limite)

    def obter_jogo(self, game_id: int) -> Game:
        jogo = self.repository.obter(game_id)
        if jogo is None:
            raise GameNotFound(game_id)
        return jogo

    def criar_jogo(self, dados: GameCreate) -> Game:
        return self.repository.salvar(Game(**dados.model_dump()))

    def substituir_jogo(self, game_id: int, dados: GameUpdate) -> Game:
        jogo = self.obter_jogo(game_id)
        for campo, valor in dados.model_dump().items():
            setattr(jogo, campo, valor)
        return self.repository.salvar(jogo)

    def atualizar_jogo(self, game_id: int, dados: GamePatch) -> Game:
        jogo = self.obter_jogo(game_id)
        for campo, valor in dados.model_dump(
            exclude_unset=True, exclude_none=True
        ).items():
            setattr(jogo, campo, valor)
        return self.repository.salvar(jogo)

    def remover_jogo(self, game_id: int) -> None:
        self.repository.remover(self.obter_jogo(game_id))
