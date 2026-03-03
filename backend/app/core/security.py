from datetime import datetime, timedelta
from typing import Optional, Any, Union
from jose import jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from ..core.config import settings

# JWT Security
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Encryption Security for sensitive data
# Ensure string is exact 32 bytes for Fernet or use generated key
# For this demo, we'll try to use a valid Fernet key or generate one if invalid
try:
    fernet = Fernet(settings.ENCRYPTION_KEY.encode())
except Exception:
    # Fallback to generated key if settings one is invalid
    key = Fernet.generate_key()
    fernet = Fernet(key)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def encrypt_data(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()

def decrypt_data(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()
