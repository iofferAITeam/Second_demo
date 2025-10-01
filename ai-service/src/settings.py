from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    GEMINI_API_KEY: str | None = None
    PERPLEXITY_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None

    GOOGLE_API_KEY: str | None = None
    
    # PostgreSQL configuration (unified database)
    DATABASE_URL: str = "postgresql://ioffer_user:ioffer_password@postgres:5432/ioffer_db"
    SQL_DATABASE_URI: str = "postgresql://ioffer_user:ioffer_password@postgres:5432/ioffer_db"

    # Legacy MongoDB configuration (deprecated)
    DATABASE_HOST: str = "mongodb://mongodb:27017"
    DATABASE_NAME: str = "ioffer_agent"
    MONGODB_URL: str | None = None

settings = Settings()
