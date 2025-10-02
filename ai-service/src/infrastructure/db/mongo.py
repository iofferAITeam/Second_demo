from loguru import logger
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from src.settings import settings

class MongoDatabaseConnector:
    _instance: MongoClient | None = None

    def __new__(cls, *args, **kwargs) -> MongoClient:
        if cls._instance is None:
            try:
                cls._instance = MongoClient(settings.DATABASE_HOST)
                # Verify connection is working
                cls._instance.admin.command('ping')
                logger.info(f"Connection to MongoDB successful: {settings.DATABASE_HOST}")
            except ConnectionFailure as e:
                logger.error(f"Couldn't connect to the database: {e!s}")
                cls._instance = None
                raise

        return cls._instance

    @classmethod
    def close_connection(cls):
        """Explicitly close the connection when shutting down"""
        if cls._instance is not None:
            cls._instance.close()
            cls._instance = None
            logger.info("MongoDB connection closed")


connection = MongoDatabaseConnector()

