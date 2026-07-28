import requests

def search_city(city_name: str):

    url = "https://nominatim.openstreetmap.org/search"

    params = {
        "q": city_name,
        "format": "json",
        "limit": 1
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
        "name": city_name,
        "lat": data[0]["lat"],
        "lon": data[0]["lon"]
    }