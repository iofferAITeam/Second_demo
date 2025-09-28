
import pandas as pd
from threading import Lock
from queue import Queue
from pymysql.err import MySQLError
import pymysql
from typing import Optional, List, Dict, Any
from loguru import logger
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))
from src.settings import settings

class MySQLDatabaseConnector:
    """MySQL database connector with basic manual connection pooling using PyMySQL"""

    _instance: Optional['MySQLDatabaseConnector'] = None
    _pool: Optional[Queue] = None
    _lock: Lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, '_initialized'):
            self._initialize_pool()
            self._initialized = True

    def _initialize_pool(self):
        """Initialize a simple connection pool using a queue"""
        self._pool_size = 5
        self._pool = Queue(maxsize=self._pool_size)
        for _ in range(self._pool_size):
            conn = self._create_connection()
            self._pool.put(conn)
        logger.info(
            f"MySQL connection pool initialized successfully: {settings.MYSQL_HOST}:{settings.MYSQL_PORT}")

    def _create_connection(self):
        """Create a single PyMySQL connection"""
        return pymysql.connect(
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            database=settings.MYSQL_DATABASE,
            charset=settings.MYSQL_CHARSET,
            autocommit=True,
            cursorclass=pymysql.cursors.DictCursor,
        )

    def get_connection(self):
        """Get a connection from the pool"""
        with self._lock:
            if self._pool.empty():
                return self._create_connection()
            return self._pool.get()

    def release_connection(self, conn):
        """Return the connection to the pool"""
        with self._lock:
            if self._pool.full():
                conn.close()
            else:
                self._pool.put(conn)

    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results"""
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchall()
        except MySQLError as e:
            logger.error(f"Error executing query: {e}")
            raise
        finally:
            if conn:
                self.release_connection(conn)

    def execute_update(self, query: str, params: Optional[tuple] = None) -> int:
        """Execute an INSERT/UPDATE/DELETE query and return affected rows"""
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.rowcount
        except MySQLError as e:
            logger.error(f"Error executing update: {e}")
            raise
        finally:
            if conn:
                self.release_connection(conn)

    def execute_many(self, query: str, params_list: List[tuple]) -> int:
        """Execute multiple INSERT/UPDATE/DELETE queries"""
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor() as cursor:
                cursor.executemany(query, params_list)
                return cursor.rowcount
        except MySQLError as e:
            logger.error(f"Error executing batch update: {e}")
            raise
        finally:
            if conn:
                self.release_connection(conn)

    def query_to_dataframe(self, query: str, params: Optional[tuple] = None) -> pd.DataFrame:
        """Execute a query and return results as a pandas DataFrame"""
        results = self.execute_query(query, params)
        return pd.DataFrame(results)

    def test_connection(self) -> bool:
        """Test the database connection"""
        try:
            conn = self.get_connection()
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
            self.release_connection(conn)
            logger.info("MySQL connection test successful")
            return True
        except Exception as e:
            logger.error(f"MySQL connection test failed: {e}")
            return False


# Global instance
mysql_connector = MySQLDatabaseConnector()
mysql_connector.test_connection()