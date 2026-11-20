import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.handlers import (
    forbidden_handler,
    invalid_transition_handler,
    not_found_handler,
    unauthorized_actor_handler,
)
from app.api.router import router
from app.services.ticket import (
    Forbidden,
    InvalidTransition,
    TicketNotFound,
    UnauthorizedActor,
)

DEFAULT_CORS_ORIGINS = (
    "http://127.0.0.1:5173,"
    "http://localhost:5173,"
    "http://127.0.0.1:4173,"
    "http://localhost:4173"
)


def parse_cors_origins(value: str | None = None) -> list[str]:
    raw = (
        value if value is not None else os.getenv("CORS_ORIGINS", DEFAULT_CORS_ORIGINS)
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


app = FastAPI(title="Mini Helpdesk Inatel")
app.add_middleware(
    CORSMiddleware,
    allow_origins=parse_cors_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-Actor-Id"],
)
app.add_exception_handler(UnauthorizedActor, unauthorized_actor_handler)
app.add_exception_handler(TicketNotFound, not_found_handler)
app.add_exception_handler(Forbidden, forbidden_handler)
app.add_exception_handler(InvalidTransition, invalid_transition_handler)
app.include_router(router)
