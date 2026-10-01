from typing import Annotated

from fastapi import APIRouter, Path, Query, status

from app.schemas.car import Car, CarCreate, CarPatch, CarUpdate
from app.services import car as service

router = APIRouter(prefix="/cars", tags=["cars"])
CarId = Annotated[int, Path(gt=0)]


@router.get("", response_model=list[Car])
def listar_carros(
    marca: Annotated[str | None, Query(min_length=1)] = None,
    limite: Annotated[int, Query(ge=1, le=100)] = 10,
) -> list[Car]:
    return service.listar_carros(marca, limite)


@router.get("/{car_id}", response_model=Car)
def obter_carro(car_id: CarId) -> Car:
    return service.obter_carro(car_id)


@router.post("", response_model=Car, status_code=status.HTTP_201_CREATED)
def criar_carro(dados: CarCreate) -> Car:
    return service.criar_carro(dados)


@router.put("/{car_id}", response_model=Car)
def substituir_carro(car_id: CarId, dados: CarUpdate) -> Car:
    return service.substituir_carro(car_id, dados)


@router.patch("/{car_id}", response_model=Car)
def atualizar_carro(car_id: CarId, dados: CarPatch) -> Car:
    return service.atualizar_carro(car_id, dados)


@router.delete("/{car_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_carro(car_id: CarId) -> None:
    service.remover_carro(car_id)
