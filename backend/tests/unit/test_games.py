from unittest.mock import Mock

import pytest
from pydantic import ValidationError

from app.models.game import Game
from app.repositories.game import GameRepository
from app.schemas.game import GameCreate, GamePatch, GameUpdate
from app.services.game import GameNotFound, GameService


@pytest.mark.parametrize("schema", [GameCreate, GameUpdate])
def test_modelo_completo(schema, game_data):
    assert schema(**game_data).model_dump() == game_data


@pytest.mark.parametrize(
    ("campo", "valor"),
    [
        ("genero", ""),
        ("titulo", ""),
        ("ano", 1957),
        ("ano", 2101),
        ("plataforma", ""),
        ("preco", 0),
        ("preco", -1),
        ("extra", "valor"),
    ],
)
def test_modelo_rejeita_dados_invalidos(campo, valor, game_data):
    with pytest.raises(ValidationError):
        GameCreate(**(game_data | {campo: valor}))


def test_put_exige_todos_os_campos():
    with pytest.raises(ValidationError):
        GameUpdate(plataforma="PC")


def test_patch_inclui_apenas_campos_enviados():
    assert GamePatch(plataforma="PC").model_dump(exclude_unset=True) == {
        "plataforma": "PC"
    }


@pytest.fixture
def repository():
    return Mock(spec=GameRepository)


@pytest.fixture
def service(repository):
    return GameService(repository)


def test_listar_delega_filtro_e_limite(service, repository):
    repository.listar.return_value = []
    assert service.listar_jogos("rpg", 2) == []
    repository.listar.assert_called_once_with("rpg", 2)


def test_obter_registro(service, repository, game_data):
    jogo = Game(id=7, **game_data)
    repository.obter.return_value = jogo
    assert service.obter_jogo(7) is jogo


@pytest.mark.parametrize("operacao", ["obter", "substituir", "atualizar", "remover"])
def test_rejeita_registro_inexistente(service, repository, game_data, operacao):
    repository.obter.return_value = None
    args = {
        "obter": (7,),
        "substituir": (7, GameUpdate(**game_data)),
        "atualizar": (7, GamePatch()),
        "remover": (7,),
    }
    with pytest.raises(GameNotFound):
        getattr(service, f"{operacao}_jogo")(*args[operacao])
    repository.salvar.assert_not_called()
    repository.remover.assert_not_called()


def test_criar_envia_modelo_orm(service, repository, game_data):
    service.criar_jogo(GameCreate(**game_data))
    jogo = repository.salvar.call_args.args[0]
    assert jogo.id is None
    assert {campo: getattr(jogo, campo) for campo in game_data} == game_data


def test_substituir_todos_os_campos(service, repository, game_data):
    jogo = Game(id=7, **(game_data | {"titulo": "Anterior", "preco": 10}))
    repository.obter.return_value = jogo
    service.substituir_jogo(7, GameUpdate(**game_data))
    assert {campo: getattr(jogo, campo) for campo in game_data} == game_data
    repository.salvar.assert_called_once_with(jogo)


def test_patch_preserva_omitidos_e_nulos(service, repository, game_data):
    jogo = Game(id=7, **game_data)
    repository.obter.return_value = jogo
    service.atualizar_jogo(7, GamePatch(plataforma="Switch", titulo=None))
    assert jogo.plataforma == "Switch"
    assert jogo.titulo == game_data["titulo"]
    repository.salvar.assert_called_once_with(jogo)


def test_remover_envia_registro(service, repository, game_data):
    jogo = Game(id=7, **game_data)
    repository.obter.return_value = jogo
    service.remover_jogo(7)
    repository.remover.assert_called_once_with(jogo)
