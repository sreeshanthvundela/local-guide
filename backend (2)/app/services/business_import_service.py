from sqlalchemy.orm import Session
from app.models.business import Business


def save_businesses(
    db: Session,
    businesses: list
):

    count = 0

    for item in businesses:

        if item["lat"] is None or item["lon"] is None:
            continue

        existing = db.query(Business).filter(
            Business.osm_id == item["id"]
        ).first()

        if existing:
            continue

        business = Business(
            osm_id=item["id"],
            name=item["name"],
            category=item["category"],
            latitude=item["lat"],
            longitude=item["lon"]
        )

        db.add(business)

        count += 1

    db.commit()

    return count