import pytest
from pydantic import ValidationError

from app.schemas.car import CarCreate, CarPatch, CarUpdate
from app.services import car as service


@pytest.mark.parametrize("schema", [CarCreate, CarUpdate])
def test_modelo_completo(schema, car_data):
    assert schema(**car_data).model_dump() == car_data


@pytest.mark.parametrize(
    ("campo", "valor"),
    [
        ("marca", ""),
        ("modelo", ""),
        ("ano", 1885),
        ("ano", 2101),
        ("cor", ""),
        ("preco", 0),
        ("preco", -1),
        ("extra", "valor"),
    ],
)
def test_modelo_rejeita_dados_invalidos(campo, valor, car_data):
    with pytest.raises(ValidationError):
        CarCreate(**(car_data | {campo: valor}))


def test_put_exige_todos_os_campos():
    with pytest.raises(ValidationError):
        CarUpdate(cor="Azul")


def test_patch_inclui_apenas_campos_enviados():
    assert CarPatch(cor="Azul").model_dump(exclude_unset=True) == {"cor": "Azul"}


def test_listar_filtra_marca_e_limita():
    carros = service.listar_carros(marca="toyota", limite=1)
    assert len(carros) == 1
    assert carros[0].modelo == "Corolla"


def test_listar_marca_sem_resultados():
    assert service.listar_carros(marca="Inexistente") == []


def test_obter_preserva_id_solicitado():
    assert service.obter_carro(7).id == 7


def test_criar_monta_resposta(car_data):
    carro = service.criar_carro(CarCreate(**car_data))
    assert carro.model_dump() == {"id": 1, **car_data}


def test_substituir_monta_resposta_completa(car_data):
    carro = service.substituir_carro(7, CarUpdate(**car_data))
    assert carro.model_dump() == {"id": 7, **car_data}


def test_atualizar_preserva_campos_omitidos():
    antes = service.obter_carro(7)
    depois = service.atualizar_carro(7, CarPatch(cor="Azul"))
    assert depois.model_dump() == antes.model_dump() | {"cor": "Azul"}
    assert service.obter_carro(7) == antes


def test_remover_demonstrativo():
    assert service.remover_carro(7) is None
