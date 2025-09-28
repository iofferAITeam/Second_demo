from loguru import logger
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Optional

from src.settings import settings

class PostgreSQLConnector:
    _instance: Optional["PostgreSQLConnector"] = None
    _engine = None
    _session_factory = None

    def __new__(cls, *args, **kwargs) -> "PostgreSQLConnector":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        """初始化数据库连接"""
        try:
            # 构建数据库 URL
            database_url = getattr(settings, 'DATABASE_URL',
                f"postgresql://postgres:password@localhost:5432/college_recommendation")

            # 创建引擎
            self._engine = create_engine(
                database_url,
                echo=False,  # 设置为 True 可以看到 SQL 查询日志
                pool_pre_ping=True,  # 验证连接有效性
                pool_recycle=3600,   # 每小时回收连接
            )

            # 测试连接
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))

            # 创建会话工厂
            self._session_factory = sessionmaker(bind=self._engine)

            logger.info(f"PostgreSQL connection successful: {database_url}")

        except SQLAlchemyError as e:
            logger.error(f"Couldn't connect to PostgreSQL: {e}")
            self._engine = None
            self._session_factory = None
            raise

    def get_session(self) -> Session:
        """获取数据库会话"""
        if self._session_factory is None:
            raise RuntimeError("Database not initialized")
        return self._session_factory()

    def get_engine(self):
        """获取数据库引擎"""
        if self._engine is None:
            raise RuntimeError("Database not initialized")
        return self._engine

    @classmethod
    def close_connection(cls):
        """关闭数据库连接"""
        if cls._instance and cls._instance._engine:
            cls._instance._engine.dispose()
            cls._instance._engine = None
            cls._instance._session_factory = None
            logger.info("PostgreSQL connection closed")

# 创建全局连接实例
postgres_connector = PostgreSQLConnector()