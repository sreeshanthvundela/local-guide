from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.user import User
from app.models.business import Business
from app.models.search_log import SearchLog

router = APIRouter()


@router.get("/")
def get_stats(db: Session = Depends(get_db)):

    top_keywords = (
        db.query(
            SearchLog.query,
            func.count(SearchLog.id).label("count")
        )
        .group_by(SearchLog.query)
        .order_by(func.count(SearchLog.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_users": db.query(User).count(),
        "total_businesses": db.query(Business).count(),
        "total_searches": db.query(SearchLog).count(),
        "top_keywords": [
            {
                "keyword": row.query,
                "count": row.count
            }
            for row in top_keywords
        ]
    }
