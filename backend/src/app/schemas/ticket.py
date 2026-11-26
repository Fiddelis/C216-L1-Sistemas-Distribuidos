from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Status(StrEnum):
    ABERTO = "Aberto"
    EM_ANDAMENTO = "Em andamento"
    AGUARDANDO_ALUNO = "Aguardando aluno"
    RESOLVIDO = "Resolvido"
    FECHADO = "Fechado"


class Category(StrEnum):
    REDE = "rede"
    SOFTWARE = "software"
    HARDWARE = "hardware"
    CONTA = "conta"


class Priority(StrEnum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"


class TicketCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(min_length=1)
    category: Category
    # Prioridade é definida pela TI (padrão media na criação pelo aluno).


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, min_length=1)
    category: Category | None = None
    priority: Priority | None = None


class TransitionRequest(BaseModel):
    to_status: Status


class ActorRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    role: Literal["student", "it"]


class MessageRead(BaseModel):
    id: int
    author_user_id: str
    author_name: str
    author_role: Literal["student", "it"]
    body: str
    created_at: datetime


class MessageCreate(BaseModel):
    body: str = Field(min_length=1)

    @field_validator("body")
    @classmethod
    def strip_body(cls, value: str) -> str:
        text = value.strip()
        if not text:
            raise ValueError("mensagem vazia")
        return text


class EventRead(BaseModel):
    id: int
    actor_user_id: str
    actor_name: str
    actor_role: Literal["student", "it"]
    from_status: Status | None
    to_status: Status
    created_at: datetime


class TicketRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    category: Category
    priority: Priority
    status: Status
    owner_user_id: str
    created_at: datetime
    updated_at: datetime
    allowed_transitions: list[Status] = []
    allowed_patch_fields: list[str] = []
    messages: list[MessageRead] = []
    unread_message: MessageRead | None = None
    events: list[EventRead] = []
