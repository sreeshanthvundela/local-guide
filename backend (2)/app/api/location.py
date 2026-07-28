from fastapi import APIRouter

router = APIRouter()

@router.get("/current")
def get_current_location():
    return {
        "status": "success",
        "message": "Location API Working"
    }