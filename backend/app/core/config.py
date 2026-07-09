from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8", 
        case_sensitive=True,
        extra="ignore"
    )
    
    APP_NAME: str = "SafeRoute AI Backend"
    API_VERSION: str = "v1"
    
    # Database URL configuration
    DATABASE_URL: str
    
    # Supabase Client credentials
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # JWT authentication security configs
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

settings = Settings()
