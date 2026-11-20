from fastapi import Request
from fastapi.responses import JSONResponse

from app.services.ticket import (
    Forbidden,
    InvalidTransition,
    TicketNotFound,
    UnauthorizedActor,
)


async def unauthorized_actor_handler(_request: Request, _exc: UnauthorizedActor):
    return JSONResponse(
        status_code=401,
        content={"detail": "Unknown or missing actor", "code": "unauthorized_actor"},
    )


async def not_found_handler(_request: Request, _exc: TicketNotFound):
    return JSONResponse(
        status_code=404,
        content={"detail": "Ticket not found", "code": "not_found"},
    )


async def forbidden_handler(_request: Request, _exc: Forbidden):
    return JSONResponse(
        status_code=403,
        content={"detail": "Action not allowed", "code": "forbidden"},
    )


async def invalid_transition_handler(_request: Request, _exc: InvalidTransition):
    return JSONResponse(
        status_code=409,
        content={"detail": "Invalid status transition", "code": "invalid_transition"},
    )
