from fastapi import APIRouter

from app.api.routes import games, general

router = APIRouter()
router.include_router(general.router)
router.include_router(games.router)
