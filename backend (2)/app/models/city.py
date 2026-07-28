from sqlalchemy import Column, Integer, String, Float
from app.models.base import Base

class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    latitude = Column(Float)
    longitude = Column(Float)