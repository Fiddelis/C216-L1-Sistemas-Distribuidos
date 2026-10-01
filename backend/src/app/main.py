from fastapi import FastAPI

from app.api.router import router

app = FastAPI(title="C216 - Sistemas Distribuídos")
app.include_router(router)
