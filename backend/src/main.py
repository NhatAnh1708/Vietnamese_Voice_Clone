import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.api import router as health_routers
from routes.text2speech import router as voice_routers

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_routers)
app.include_router(voice_routers)
