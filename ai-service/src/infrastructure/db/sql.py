from loguru import logger
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

from src.settings import settings


class SQLDatabaseConnector:
    _instance: Engine | None = None

    def __new__(cls, *args, **kwargs) -> Engine:
        if cls._instance is None:
            try:
                cls._instance = create_engine(settings.SQL_DATABASE_URI)
                # Test the connection
                with cls._instance.connect() as connection:
                    logger.info("Connection to SQL database successful.")
            except SQLAlchemyError as e:
                logger.error(f"Couldn't connect to the SQL database: {e!s}")
                raise

        logger.info(f"Connection to SQL Database with URI successful: {settings.SQL_DATABASE_URI}")
        return cls._instance

    @classmethod
    def get_connection(cls) -> Engine:
        """Get database connection with lazy initialization"""
        return cls()


# Remove module-level connection instantiation
# connection = SQLDatabaseConnector()  # This was causing the immediate connection attempt
