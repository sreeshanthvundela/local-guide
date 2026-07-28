from sqlalchemy import Column, Integer, String, ForeignKey
from app.models.base import Base


class Review(Base):

    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)

    business_id = Column(
        Integer,
        ForeignKey("businesses.id")
    )

    user_name = Column(String(100))

    rating = Column(Integer)

    comment = Column(String(1000))