import requests

def geocode_address(address: str):
    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": address,
        "format": "json",
        "limit": 1,
    }

    headers = {
        "User-Agent": "LocalGuideApp"
    }

    response = requests.get(
        url,
        params=params,
        headers=headers
    )

    data = response.json()

    if not data:
        return None

    return {
        "name": address,
        "lat": float(data[0]["lat"]),
        "lon": float(data[0]["lon"])
    }