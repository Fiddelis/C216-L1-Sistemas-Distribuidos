from fastapi import FastAPI

from app.api.handlers import game_not_found_handler
from app.api.router import router
from app.services.game import GameNotFound

app = FastAPI(title="C216 - Sistemas Distribuídos")
app.add_exception_handler(GameNotFound, game_not_found_handler)
app.include_router(router)
