from fastapi import Request
from fastapi.responses import JSONResponse

from app.services.game import GameNotFound


async def game_not_found_handler(request: Request, exc: GameNotFound) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": "Jogo não encontrado"})
