from fastapi import APIRouter
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.dependencies import get_db
from app.models.business import Business

router = APIRouter()


@router.get("/")
def get_categories(
    db: Session = Depends(get_db)
):

    businesses = db.query(Business).all()

    categories = {}

    for item in businesses:

        category = item.category

        if category not in categories:
            categories[category] = 0

        categories[category] += 1

    return categories