from datetime import datetime, timezone
from math import radians, sin, cos, sqrt, atan2

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.event import Event
from app.models.advertisement import Advertisement


router = APIRouter()


def calculate_distance(lat1, lon1, lat2, lon2):
    """Return distance between two coordinates in meters."""

    earth_radius = 6371000

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1)
        * cos(lat2)
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius * c


@router.get("/live")
def get_live_content(
    lat: float,
    lon: float,
    radius: int = 2000,
    db: Session = Depends(get_db),
):
    """
    Get currently active events and advertisements
    near the requested map location.
    """

    # Current UTC time
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # ---------------------------------
    # ACTIVE EVENTS
    # ---------------------------------

    events = (
        db.query(Event)
        .filter(
            Event.start_time <= now,
            Event.end_time >= now,
        )
        .all()
    )

    nearby_events = []

    for event in events:

        distance = calculate_distance(
            lat,
            lon,
            event.latitude,
            event.longitude,
        )

        if distance <= radius:

            nearby_events.append(
                {
                    "id": event.id,
                    "title": event.title,
                    "description": event.description,
                    "latitude": event.latitude,
                    "longitude": event.longitude,
                    "location": event.location,
                    "image_url": event.image_url,
                    "start_time": event.start_time,
                    "end_time": event.end_time,
                    "distance": round(distance),
                }
            )

    # ---------------------------------
    # ACTIVE ADVERTISEMENTS
    # ---------------------------------

    advertisements = (
        db.query(Advertisement)
        .filter(
            Advertisement.start_time <= now,
            Advertisement.end_time >= now,
        )
        .all()
    )

    nearby_ads = []

    for ad in advertisements:

        distance = calculate_distance(
            lat,
            lon,
            ad.latitude,
            ad.longitude,
        )

        if distance <= radius:

            nearby_ads.append(
                {
                    "id": ad.id,
                    "title": ad.title,
                    "description": ad.description,
                    "business_name": ad.business_name,
                    "latitude": ad.latitude,
                    "longitude": ad.longitude,
                    "image_url": ad.image_url,
                    "start_time": ad.start_time,
                    "end_time": ad.end_time,
                    "distance": round(distance),
                }
            )

    # Closest items first
    nearby_events.sort(key=lambda x: x["distance"])
    nearby_ads.sort(key=lambda x: x["distance"])

    return {
        "events": nearby_events,
        "advertisements": nearby_ads,
    }
