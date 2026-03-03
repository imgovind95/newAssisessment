from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fraud & Spam Call Detector"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cyber-secure-neon-2026-secret-key")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    SQLALCHEMY_DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./sql_app.db")
    
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "Gv_0_W1n_D-95-Cyber-Security-Neon-Accents==")

    class Config:
        case_sensitive = True

settings = Settings()
