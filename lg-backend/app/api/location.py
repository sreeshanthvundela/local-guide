from fastapi import APIRouter
from app.services.geocoding_service import geocode_address

router = APIRouter()

@router.get("/current")
def get_current_location():
    return {
        "status": "success",
        "message": "Location API Working"
    }

@router.get("/geocode")
def geocode(q: str):
    result = geocode_address(q)
    if not result:
        return {"error": "Location not found"}
    return result