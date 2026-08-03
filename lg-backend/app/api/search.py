from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.dependencies.auth import get_current_user
from app.models.search_log import SearchLog
from app.models.user import User
from app.services.overpass_service import search_places

router = APIRouter()


@router.get("/")
def search(
    q: str = Query(..., min_length=1),
    lat: float = Query(...),
    lon: float = Query(...),
    radius: int = Query(default=10000, ge=1000, le=30000),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.add(
        SearchLog(
            user_id=current_user.id,
            query=q,
        )
    )
    db.commit()

    return search_places(lat, lon, q, radius)
