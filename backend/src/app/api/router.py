from fastapi import APIRouter

from app.api.routes import tickets

router = APIRouter()
router.include_router(tickets.router)
