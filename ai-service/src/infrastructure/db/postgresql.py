from loguru import logger
from sqlalchemy import create_engine, MetaData, Table, Column, String, DateTime, Text, Integer, Float, Boolean
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime

from src.settings import settings

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    password = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = 'user_profiles'

    id = Column(String, primary_key=True)
    userId = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    wechat = Column(String, nullable=True)
    birthDate = Column(DateTime, nullable=True)
    nationality = Column(String, nullable=True)
    currentEducation = Column(String, nullable=True)
    gpa = Column(Float, nullable=True)
    major = Column(String, nullable=True)
    graduationDate = Column(DateTime, nullable=True)
    toefl = Column(Integer, nullable=True)
    ielts = Column(Float, nullable=True)
    gre = Column(Integer, nullable=True)
    gmat = Column(Integer, nullable=True)
    experiences = Column(Text, nullable=True)  # JSON string
    goals = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PostgreSQLDatabaseConnector:
    _instance: Engine | None = None
    _session_maker: sessionmaker | None = None

    def __new__(cls, *args, **kwargs) -> Engine:
        if cls._instance is None:
            try:
                cls._instance = create_engine(settings.DATABASE_URL)
                cls._session_maker = sessionmaker(bind=cls._instance)

                # Test the connection
                with cls._instance.connect() as connection:
                    logger.info("Connection to PostgreSQL database successful.")
            except SQLAlchemyError as e:
                logger.error(f"Couldn't connect to the PostgreSQL database: {e!s}")
                raise

        return cls._instance

    @classmethod
    def get_connection(cls) -> Engine:
        """Get database connection with lazy initialization"""
        return cls()

    @classmethod
    def get_session(cls):
        """Get a new database session"""
        if cls._session_maker is None:
            cls()  # Initialize if not already done
        return cls._session_maker()

    @classmethod
    def get_user_by_id(cls, user_id: str):
        """Get user by ID from PostgreSQL database"""
        session = cls.get_session()
        try:
            user = session.query(User).filter(User.id == user_id).first()
            if user:
                # Also get user profile
                profile = session.query(UserProfile).filter(UserProfile.userId == user_id).first()
                user_data = {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'avatar': user.avatar,
                    'createdAt': user.createdAt,
                    'updatedAt': user.updatedAt
                }
                if profile:
                    import json
                    user_data['profile'] = {
                        'phone': profile.phone,
                        'wechat': profile.wechat,
                        'birthDate': profile.birthDate,
                        'nationality': profile.nationality,
                        'currentEducation': profile.currentEducation,
                        'gpa': profile.gpa,
                        'major': profile.major,
                        'graduationDate': profile.graduationDate,
                        'toefl': profile.toefl,
                        'ielts': profile.ielts,
                        'gre': profile.gre,
                        'gmat': profile.gmat,
                        'experiences': json.loads(profile.experiences) if profile.experiences else {},
                        'goals': profile.goals,
                        'createdAt': profile.createdAt,
                        'updatedAt': profile.updatedAt
                    }
                return user_data
            return None
        except Exception as e:
            logger.error(f"Error retrieving user {user_id}: {e}")
            return None
        finally:
            session.close()

    @classmethod
    def close_connection(cls):
        """Explicitly close the connection when shutting down"""
        if cls._instance is not None:
            cls._instance.dispose()
            cls._instance = None
            cls._session_maker = None
            logger.info("PostgreSQL connection closed")


# Create connection instance
connection = PostgreSQLDatabaseConnector()