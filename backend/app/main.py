from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, get_engine as get_db_engine, get_async_session
from app.routers import decisions, knowledge, simulator


@asynccontextmanager
async def lifespan(app: FastAPI):
    engine = get_db_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.services.rule_service import init_rules
    session = get_async_session()
    async with session() as s:
        await init_rules(s)

    yield
    await engine.dispose()


app = FastAPI(title="Expert System API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulator.router)
app.include_router(decisions.router)
app.include_router(knowledge.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
