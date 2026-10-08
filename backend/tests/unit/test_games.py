import pytest
from pydantic import ValidationError

from app.schemas.game import GameCreate, GamePatch, GameUpdate
from app.services import game as service


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


def test_listar_filtra_genero_e_limita():
    jogos = service.listar_jogos(genero="aventura", limite=1)
    assert len(jogos) == 1
    assert jogos[0].titulo == "Ilhas Perdidas"


def test_listar_genero_sem_resultados():
    assert service.listar_jogos(genero="Inexistente") == []


def test_obter_preserva_id_solicitado():
    assert service.obter_jogo(7).id == 7


def test_criar_monta_resposta(game_data):
    jogo = service.criar_jogo(GameCreate(**game_data))
    assert jogo.model_dump() == {"id": 1, **game_data}


def test_substituir_monta_resposta_completa(game_data):
    jogo = service.substituir_jogo(7, GameUpdate(**game_data))
    assert jogo.model_dump() == {"id": 7, **game_data}


def test_atualizar_preserva_campos_omitidos():
    antes = service.obter_jogo(7)
    depois = service.atualizar_jogo(7, GamePatch(plataforma="PC"))
    assert depois.model_dump() == antes.model_dump() | {"plataforma": "PC"}
    assert service.obter_jogo(7) == antes


def test_remover_demonstrativo():
    assert service.remover_jogo(7) is None
