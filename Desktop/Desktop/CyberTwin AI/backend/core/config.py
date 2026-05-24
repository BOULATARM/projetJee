from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "CyberTwin AI"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "postgresql+asyncpg://cybertwin:cybertwin@db:5432/cybertwin"
    REDIS_URL: str = "redis://redis:6379"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    SECRET_KEY: str = "cybertwin-secret-key-change-in-production"
    CORS_ORIGINS: list = ["http://localhost:3000", "http://frontend:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
