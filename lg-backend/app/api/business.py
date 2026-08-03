from fastapi import APIRouter
from app.services.navigation_service import get_route
from fastapi import Depends
from sqlalchemy.orm import Session
from app.services.overpass_service import (
    get_nearby_places,
    get_business_details,
    get_all_nearby_services
)
from app.database.dependencies import get_db
from app.models.business import Business
from app.services.business_import_service import (
    save_businesses
)


router = APIRouter()


@router.get("/nearby")
def nearby_businesses(
    lat: float,
    lon: float,
    category: str = "restaurant"
):
    return get_nearby_places(
        lat=lat,
        lon=lon,
        category=category
    )
@router.get("/all-nearby")
def all_nearby_services(
    lat: float,
    lon: float,
    radius: int = 1000
):

    return get_all_nearby_services(
        lat=lat,
        lon=lon,
        radius=radius
    )
@router.post("/import")
def import_businesses(
    lat: float,
    lon: float,
    category: str,
    db: Session = Depends(get_db)
):

    businesses = get_nearby_places(
        lat=lat,
        lon=lon,
        category=category
    )

    if isinstance(businesses, dict):
        return businesses
    print(type(businesses))
    print(businesses)
    print("BUSINESSES FOUND:", len(businesses))
    inserted = save_businesses(
        db,
        businesses
    )

    return {
        "inserted": inserted
    }
@router.get("/database")
def get_saved_businesses(
    db: Session = Depends(get_db)
):

    businesses = db.query(Business).all()

    return businesses
@router.get("/route")
def route(
    start_lat: float,
    start_lon: float,
    end_lat: float,
    end_lon: float,
):
    return get_route(
        start_lat=start_lat,
        start_lon=start_lon,
        end_lat=end_lat,
        end_lon=end_lon,
    )
@router.post("/import-all")
def import_all_services(
    lat: float,
    lon: float,
    radius: int = 5000,
    db: Session = Depends(get_db)
):

    services = get_all_nearby_services(
        lat=lat,
        lon=lon,
        radius=radius
    )

    inserted = save_businesses(
        db,
        services
    )

    return {
        "found": len(services),
        "inserted": inserted
    }

@router.get("/saved")
def nearby_saved_businesses(
    category: str,
    db: Session = Depends(get_db)
):
    return (
        db.query(Business)
        .filter(Business.category == category)
        .limit(50)
        .all()
    )


# Keep the parameterized route last so /saved, /database, and /route remain
# reachable as their own endpoints.
@router.get("/{osm_id}")
def business_details(osm_id: int):
    return get_business_details(osm_id)
