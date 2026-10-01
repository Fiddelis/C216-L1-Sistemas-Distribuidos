from fastapi import APIRouter

from app.api.routes import cars, general

router = APIRouter()
router.include_router(general.router)
router.include_router(cars.router)
