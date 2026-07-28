from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.dependencies.auth import get_current_user

from app.models.user import User
from app.models.search_log import SearchLog

router = APIRouter()


@router.get("/")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    total_searches = (
        db.query(SearchLog)
        .filter(SearchLog.user_id == current_user.id)
        .count()
    )

    recent_searches = (
        db.query(SearchLog)
        .filter(SearchLog.user_id == current_user.id)
        .order_by(SearchLog.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "total_searches": total_searches,
        "recent_searches": [
            search.query for search in recent_searches
        ]
    }
