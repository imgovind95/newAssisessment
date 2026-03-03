from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from .api import auth, detector, admin, history
from .db.session import engine, Base
from .core.config import settings

# Initialize Database
Base.metadata.create_all(bind=engine)

# Rate Limiter setup
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"])
app.include_router(detector.router, prefix=f"{settings.API_V1_STR}/detector", tags=["Detector"])
app.include_router(admin.router, prefix=f"{settings.API_V1_STR}/admin", tags=["Admin"])
app.include_router(history.router, prefix=f"{settings.API_V1_STR}/history", tags=["History"])

@app.get("/")
def root():
    return {"status": "Fraud & Spam Call Detector API is active", "version": "1.0.0"}

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
