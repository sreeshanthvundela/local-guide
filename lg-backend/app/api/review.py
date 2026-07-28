from fastapi import APIRouter
from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.review import Review

router = APIRouter()


@router.post("/")
def create_review(
    business_id: int,
    user_name: str,
    rating: int,
    comment: str,
    db: Session = Depends(get_db)
):

    review = Review(
        business_id=business_id,
        user_name=user_name,
        rating=rating,
        comment=comment
    )

    db.add(review)

    db.commit()

    return {
        "message": "Review added"
    }
@router.get("/{business_id}")
def get_reviews(
    business_id: int,
    db: Session = Depends(get_db)
):

    return db.query(Review).filter(
        Review.business_id == business_id
    ).all()
@router.get("/{business_id}/rating")
def average_rating(
    business_id: int,
    db: Session = Depends(get_db)
):

    reviews = db.query(Review).filter(
        Review.business_id == business_id
    ).all()

    if not reviews:
        return {
            "rating": 0
        }

    avg = sum(
        review.rating
        for review in reviews
    ) / len(reviews)

    return {
        "rating": round(avg, 1),
        "total_reviews": len(reviews)
    }