from pydantic import BaseModel, ConfigDict, Field


class GameBase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    genero: str = Field(min_length=1, max_length=50)
    titulo: str = Field(min_length=1, max_length=50)
    ano: int = Field(ge=1958, le=2100)
    plataforma: str = Field(min_length=1, max_length=30)
    preco: float = Field(gt=0, allow_inf_nan=False)


class GameCreate(GameBase):
    pass


class GameUpdate(GameBase):
    pass


class GamePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")

    genero: str | None = Field(default=None, min_length=1, max_length=50)
    titulo: str | None = Field(default=None, min_length=1, max_length=50)
    ano: int | None = Field(default=None, ge=1958, le=2100)
    plataforma: str | None = Field(default=None, min_length=1, max_length=30)
    preco: float | None = Field(default=None, gt=0, allow_inf_nan=False)


class Game(GameBase):
    id: int = Field(gt=0)
