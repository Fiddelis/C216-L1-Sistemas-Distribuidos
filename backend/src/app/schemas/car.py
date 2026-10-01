from pydantic import BaseModel, ConfigDict, Field


class CarBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    marca: str = Field(min_length=1, max_length=50)
    modelo: str = Field(min_length=1, max_length=50)
    ano: int = Field(ge=1886, le=2100)
    cor: str = Field(min_length=1, max_length=30)
    preco: float = Field(gt=0, allow_inf_nan=False)


class CarCreate(CarBase):
    pass


class CarUpdate(CarBase):
    pass


class CarPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    marca: str | None = Field(default=None, min_length=1, max_length=50)
    modelo: str | None = Field(default=None, min_length=1, max_length=50)
    ano: int | None = Field(default=None, ge=1886, le=2100)
    cor: str | None = Field(default=None, min_length=1, max_length=30)
    preco: float | None = Field(default=None, gt=0, allow_inf_nan=False)


class Car(CarBase):
    id: int = Field(gt=0)
