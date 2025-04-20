from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URI: str
    DATABASE_NAME: str = "my_event_app"
    SECRET_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()