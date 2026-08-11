from fastapi import FastAPI
from app.api.location import router as location_router
from app.api.search import router as search_router
from app.database.connection import engine
from app.api.business import router as business_router
from app.models.base import Base
from app.api.category import router as category_router
from app.models.business import Business
from app.models.category import Category
from app.models.city import City
from app.api.recommendation import router as recommendation_router
from app.models.review import Review
from app.api.review import router as review_router
from app.models.user import User
from app.models.search_log import SearchLog
from app.api.auth import router as auth_router
from app.api.search import router as search_router
from app.api.stats import router as stats_router
from app.api.profile import router as profile_router
from fastapi.middleware.cors import CORSMiddleware
from app.api.live import router as live_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Local Guide API",
    version="1.0.0"
)
app.include_router(
    location_router,
    prefix="/location",
    tags=["Location"]
)
app.include_router(
    profile_router,
    prefix="/profile",
    tags=["Profile"]
)
app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)
app.include_router(
    stats_router,
    prefix="/stats",
    tags=["Statistics"]
)
app.include_router(
    search_router,
    prefix="/search",
    tags=["Search"]
)

app.include_router(
    business_router,
    prefix="/business",
    tags=["Business"]
)
app.include_router(
    category_router,
    prefix="/category",
    tags=["Category"]
)
app.include_router(
    live_router,
    prefix="/location",
    tags=["Live Content"],
)
app.include_router(
    recommendation_router,
    prefix="/recommendation",
    tags=["Recommendation"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {
        "message": "Local Guide Backend Running"
    }
app.include_router(
    review_router,
    prefix="/review",
    tags=["Review"]
)
