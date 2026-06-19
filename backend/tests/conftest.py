import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.core.database import Base, get_db, set_engine
from app.main import app
from app.core.expert import ExpertEngine, KnowledgeBase
from app.core.expert.rules import build_tomato_rules

TEST_DATABASE_URL = "sqlite+aiosqlite://"


@pytest_asyncio.fixture(autouse=True)
async def setup_engine():
    eng = create_async_engine(TEST_DATABASE_URL, echo=False)
    set_engine(eng)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await eng.dispose()
    set_engine(None)


@pytest_asyncio.fixture
async def db_session(setup_engine):
    from app.core.database import get_engine

    session = async_sessionmaker(get_engine(), expire_on_commit=False)()
    try:
        yield session
    finally:
        await session.close()


@pytest_asyncio.fixture
async def client(setup_engine):
    from httpx import AsyncClient, ASGITransport
    from app.core.database import get_engine

    async def override_get_db():
        session = async_sessionmaker(get_engine(), expire_on_commit=False)()
        try:
            yield session
        finally:
            await session.close()

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
def expert_engine():
    kb = KnowledgeBase()
    rules = build_tomato_rules()
    return ExpertEngine(kb, rules)
