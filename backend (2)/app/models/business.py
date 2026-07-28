from sqlalchemy import Column, Integer, String, Float, BigInteger
from sqlalchemy import BigInteger
from sqlalchemy import Integer


from app.models.base import Base


class Business(Base):

    __tablename__ = "businesses"

    id = Column(Integer, primary_key=True)

    osm_id = Column(BigInteger, unique=True, index = True)

    name = Column(String(255))

    category = Column(String(100))

    latitude = Column(Float)

    longitude = Column(Float)

    address = Column(String(500), nullable=True)

    views = Column(Integer, default=0)
