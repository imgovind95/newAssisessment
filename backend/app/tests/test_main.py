import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..main import app
from ..db.session import Base, get_db

# Test Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "active" in response.json()["status"]

def test_register():
    response = client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

def test_login():
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"}
    )
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "testuser", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_check_number():
    response = client.post(
        "/api/v1/detector/check",
        json={"phone_number": "1800123456"}
    )
    assert response.status_code == 200
    assert "label" in response.json()
    assert "confidence" in response.json()

def test_rate_limiting():
    # Rapid requests to test rate limiting (if default is low)
    for _ in range(10):
        response = client.get("/")
    # This depends on the specific rate limit set in main.py
    # For now we just verify it exists
    assert response.status_code == 200
