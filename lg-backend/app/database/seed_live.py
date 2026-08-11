from datetime import datetime, timedelta

from app.database.session import SessionLocal
from app.models.event import Event
from app.models.advertisement import Advertisement


db = SessionLocal()

try:
    now = datetime.utcnow()

    event = Event(
        title="Local Food Festival",
        description="Live food festival happening nearby.",
        latitude=16.4925,
        longitude=80.5005,
        location="Vijayawada",
        start_time=now - timedelta(hours=2),
        end_time=now + timedelta(hours=6),
        image_url=None,
        created_at=now,
    )

    advertisement = Advertisement(
        title="20% OFF Today",
        description="Get 20% off on selected items.",
        business_name="Local Guide Restaurant",
        latitude=16.4915,
        longitude=80.4995,
        image_url=None,
        start_time=now - timedelta(hours=1),
        end_time=now + timedelta(hours=8),
        created_at=now,
    )

    db.add(event)
    db.add(advertisement)

    db.commit()

    print("Test event and advertisement added successfully.")

finally:
    db.close()
