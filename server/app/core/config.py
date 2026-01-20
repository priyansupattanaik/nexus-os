import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SECRET_KEY: str
    GROQ_API_KEY: str  # <<< We added this line

    class Config:
        env_file = ".env"
        # This tells Pydantic to ignore any other unknown variables in .env
        # instead of crashing the server
        extra = "ignore" 

settings = Settings()