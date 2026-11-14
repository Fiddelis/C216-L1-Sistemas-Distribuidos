from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_session
from app.repositories.game import GameRepository
from app.schemas.game import Game, GameCreate, GamePatch, GameUpdate
from app.services.game import GameService

router = APIRouter(prefix="/games", tags=["games"])
GameId = Annotated[int, Path(gt=0)]


def get_game_service(session: Annotated[Session, Depends(get_session)]) -> GameService:
    return GameService(GameRepository(session))


Service = Annotated[GameService, Depends(get_game_service)]


@router.get("", response_model=list[Game])
def listar_jogos(
    service: Service,
    genero: Annotated[str | None, Query(min_length=1)] = None,
    limite: Annotated[int, Query(ge=1, le=100)] = 10,
):
    return service.listar_jogos(genero, limite)


@router.get("/{game_id}", response_model=Game)
def obter_jogo(game_id: GameId, service: Service):
    return service.obter_jogo(game_id)


@router.post("", response_model=Game, status_code=status.HTTP_201_CREATED)
def criar_jogo(dados: GameCreate, service: Service):
    return service.criar_jogo(dados)


@router.put("/{game_id}", response_model=Game)
def substituir_jogo(game_id: GameId, dados: GameUpdate, service: Service):
    return service.substituir_jogo(game_id, dados)


@router.patch("/{game_id}", response_model=Game)
def atualizar_jogo(game_id: GameId, dados: GamePatch, service: Service):
    return service.atualizar_jogo(game_id, dados)


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_jogo(game_id: GameId, service: Service) -> None:
    service.remover_jogo(game_id)
