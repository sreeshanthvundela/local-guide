from pydantic import BaseModel


class BusinessCreate(BaseModel):

    osm_id: int

    name: str

    category: str

    latitude: float

    longitude: float

    address: str | None = None