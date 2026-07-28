import requests
import polyline

from app.core.config import OPENROUTESERVICE_API_KEY


def get_route(start_lat, start_lon, end_lat, end_lon):
    url = (
        "https://api.openrouteservice.org/v2/directions/driving-car/json"
    )

    headers = {
        "Authorization": OPENROUTESERVICE_API_KEY,
        "Content-Type": "application/json",
    }

    body = {
        "coordinates": [
            [start_lon, start_lat],
            [end_lon, end_lat],
        ]
    }

    response = requests.post(
        url,
        json=body,
        headers=headers,
    )

    response.raise_for_status()

    data = response.json()

    route = data["routes"][0]

    decoded = polyline.decode(route["geometry"])

    coordinates = [
        [lon, lat]
        for lat, lon in decoded
    ]

    return {
        "geometry": route["geometry"],
        "coordinates": coordinates,
        "distance": route["summary"]["distance"],
        "duration": route["summary"]["duration"],
        "segments": route["segments"],
    }
