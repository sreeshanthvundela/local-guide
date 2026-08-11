from sqlalchemy import Column, Integer, String, Text, Float, DateTime
from app.models.base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(255), nullable=False)

    description = Column(Text, nullable=True)

    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    location = Column(String(255), nullable=True)

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    image_url = Column(String(500), nullable=True)

    created_at = Column(DateTime)
