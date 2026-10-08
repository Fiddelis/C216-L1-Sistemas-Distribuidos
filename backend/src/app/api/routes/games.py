from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from app.schemas.game import Game, GameCreate, GamePatch, GameUpdate
from app.services import game as service

router = APIRouter(prefix="/games", tags=["games"])
GameId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[Game])
def listar_jogos(
    genero: Annotated[str | None, Query(min_length=1)] = None,
    limite: Annotated[int, Query(ge=1, le=100)] = 10,
) -> list[Game]:
    return service.listar_jogos(genero, limite)


@router.get("/{game_id}", response_model=Game)
def obter_jogo(game_id: GameId) -> Game:
    return service.obter_jogo(game_id)


@router.post("", response_model=Game, status_code=status.HTTP_201_CREATED)
def criar_jogo(dados: GameCreate) -> Game:
    return service.criar_jogo(dados)


@router.put("/{game_id}", response_model=Game)
def substituir_jogo(game_id: GameId, dados: GameUpdate) -> Game:
    return service.substituir_jogo(game_id, dados)


@router.patch("/{game_id}", response_model=Game)
def atualizar_jogo(game_id: GameId, dados: GamePatch) -> Game:
    return service.atualizar_jogo(game_id, dados)


@router.delete("/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_jogo(game_id: GameId) -> None:
    service.remover_jogo(game_id)
