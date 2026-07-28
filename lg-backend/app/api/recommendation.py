from fastapi import APIRouter

from app.services.recommendation_service import get_recommendations

router = APIRouter()


@router.get("/")
def recommendations():
    return get_recommendations()
