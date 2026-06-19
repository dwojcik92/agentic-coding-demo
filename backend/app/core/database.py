from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

_engine = None
_async_session = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_async_engine(settings.database_url, echo=settings.db_echo)
    return _engine


def set_engine(engine):
    global _engine, _async_session
    _engine = engine
    _async_session = None


def get_async_session():
    global _async_session
    if _async_session is None:
        _async_session = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _async_session


class Base(DeclarativeBase):
    pass


async def get_db():
    session = get_async_session()
    async with session() as s:
        try:
            yield s
        finally:
            await s.close()
