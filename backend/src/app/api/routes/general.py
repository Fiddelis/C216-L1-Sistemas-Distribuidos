from fastapi import APIRouter

from app.services import operacoes

router = APIRouter(tags=["general"])


@router.get("/")
def home():
    return operacoes.home()


@router.get("/hello/{name}")
def hello(name: str):
    return operacoes.hello(name)
