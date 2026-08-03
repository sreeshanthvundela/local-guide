import re

import requests

# Public Overpass instances can be temporarily overloaded. Try an alternate
# instance before reporting that there are no nearby places.
OVERPASS_URLS = (
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
)

CATEGORY_MAP = {
    "restaurant": [("amenity", "restaurant")],

    "cafe": [
        ("amenity", "cafe"),
        ("amenity", "fast_food"),
        ("amenity", "food_court"),
    ],

    "hospital": [
        ("amenity", "hospital"),
        ("amenity", "clinic"),
        ("amenity", "doctors"),
    ],

    "pharmacy": [
        ("amenity", "pharmacy"),
    ],

    "hotel": [
        ("tourism", "hotel"),
        ("tourism", "guest_house"),
        ("tourism", "hostel"),
        ("tourism", "motel"),
    ],

    "school": [
        ("amenity", "school"),
        ("amenity", "college"),
        ("amenity", "university"),
    ],

    "gym": [
        ("leisure", "fitness_centre"),
        ("leisure", "sports_centre"),
    ],

    "bus_station": [
        ("amenity", "bus_station"),
        ("highway", "bus_stop"),
    ],

    "bank": [
        ("amenity", "bank"),
        ("amenity", "atm"),
    ],

    "fuel": [
        ("amenity", "fuel"),
    ],

    "park": [
        ("leisure", "park"),
        ("leisure", "garden"),
    ],

    "supermarket": [
        ("shop", "supermarket"),
        ("shop", "convenience"),
        ("shop", "mall"),
    ],

    "atm": [
        ("amenity", "atm"),
    ],
}

CATEGORY_ALIASES = {
    "restaurants": "restaurant",
    "cafes": "cafe",
    "hospitals": "hospital",
    "pharmacies": "pharmacy",
    "hotels": "hotel",
    "schools": "school",
    "gyms": "gym",
    "banks": "bank",
    "parks": "park",
    "supermarkets": "supermarket",
}

def format_address(tags):
    parts = [
        tags.get("addr:housenumber"),
        tags.get("addr:street"),
        tags.get("addr:suburb"),
        tags.get("addr:city"),
        tags.get("addr:state"),
    ]

    address = ", ".join(filter(None, parts))

    if not address:
        address = (
            tags.get("addr:full")
            or tags.get("addr:place")
            or "Address unavailable"
        )

    return address


def run_overpass_query(query):
    """Run a query against available public Overpass instances."""
    for url in OVERPASS_URLS:
        try:
            response = requests.post(
                url,
                data={"data": query},
                headers={"User-Agent": "LocalGuide/1.0"},
                timeout=30,
            )

            if response.status_code == 200:
                return response.json()

            print(f"Overpass {url} returned {response.status_code}")
        except requests.RequestException as error:
            print(f"Overpass {url} failed: {error}")

    return None


def get_nearby_places(lat, lon, category="restaurant", radius=5000):

    filters = CATEGORY_MAP.get(
        category,
        [("amenity", category)]
    )

    query = """
    [out:json][timeout:25];
    (
    """

    for key, value in filters:
        query += f"""
        node["{key}"="{value}"](around:{radius},{lat},{lon});
        way["{key}"="{value}"](around:{radius},{lat},{lon});
        relation["{key}"="{value}"](around:{radius},{lat},{lon});
        """

    query += """
    );
    out center tags 150;
    """

    data = run_overpass_query(query)

    if data is None:
        return []

    places = []

    for element in data.get("elements", []):

        tags = element.get("tags", {})

        lat_value = element.get("lat")
        lon_value = element.get("lon")

        if lat_value is None:
            lat_value = element.get("center", {}).get("lat")

        if lon_value is None:
            lon_value = element.get("center", {}).get("lon")

        places.append(
            {
                "id": element.get("id"),
                "name": tags.get("name", "Unknown"),
                "category": (
                    tags.get("amenity")
                    or tags.get("tourism")
                    or tags.get("shop")
                    or tags.get("leisure")
                    or tags.get("highway")
                    or "unknown"
                ),
                "lat": lat_value,
                "lon": lon_value,
                "address": format_address(tags),
            }
        )

    return places


def get_business_details(osm_id):

    query = f"""
    [out:json][timeout:25];
    (
      node({osm_id});
      way({osm_id});
      relation({osm_id});
    );
    out center tags 1;
    """

    data = run_overpass_query(query)

    if data is None:
        return {"error": "Unable to reach an Overpass service"}

    if not data.get("elements"):
        return {"error": "Business not found"}

    element = data["elements"][0]

    tags = element.get("tags", {})

    lat_value = element.get("lat")
    lon_value = element.get("lon")

    if lat_value is None:
        lat_value = element.get("center", {}).get("lat")

    if lon_value is None:
        lon_value = element.get("center", {}).get("lon")

    category = (
        tags.get("amenity")
        or tags.get("tourism")
        or tags.get("shop")
        or tags.get("leisure")
        or "unknown"
    )

    return {
        "id": element.get("id"),
        "name": tags.get("name", "Unknown"),
        "category": category,
        "lat": lat_value,
        "lon": lon_value,
        "address": format_address(tags),
        "tags": tags,
    }


def get_all_nearby_services(lat, lon, radius=5000):
    query = f"""
    [out:json][timeout:25];
    (
      node["amenity"]["name"](around:{radius},{lat},{lon});
      way["amenity"]["name"](around:{radius},{lat},{lon});
      relation["amenity"]["name"](around:{radius},{lat},{lon});

      node["shop"]["name"](around:{radius},{lat},{lon});
      way["shop"]["name"](around:{radius},{lat},{lon});
      relation["shop"]["name"](around:{radius},{lat},{lon});

      node["tourism"]["name"](around:{radius},{lat},{lon});
      way["tourism"]["name"](around:{radius},{lat},{lon});
      relation["tourism"]["name"](around:{radius},{lat},{lon});

      node["leisure"]["name"](around:{radius},{lat},{lon});
      way["leisure"]["name"](around:{radius},{lat},{lon});
      relation["leisure"]["name"](around:{radius},{lat},{lon});
    );
    out center tags 150;
    """

    data = run_overpass_query(query)

    if data is None:
        return []

    services = []

    for element in data.get("elements", []):

        tags = element.get("tags", {})

        lat_value = element.get("lat")
        lon_value = element.get("lon")

        if lat_value is None:
            lat_value = element.get("center", {}).get("lat")

        if lon_value is None:
            lon_value = element.get("center", {}).get("lon")

        category = (
            tags.get("amenity")
            or tags.get("tourism")
            or tags.get("shop")
            or tags.get("leisure")
            or "unknown"
        )

        services.append(
            {
                "id": element.get("id"),
                "name": tags.get("name", "Unknown"),
                "category": category,
                "lat": lat_value,
                "lon": lon_value,
                "address": format_address(tags),
            }
        )

    return services
def search_places(lat, lon, query, radius=1000):
    """Search a category or a business name without scanning every service."""
    normalized_query = CATEGORY_ALIASES.get(query.strip().lower(), query.strip().lower())

    if normalized_query in CATEGORY_MAP:
        return get_nearby_places(lat, lon, normalized_query, radius)

    # Escape user input before using it in Overpass's regular-expression filter.
    name_pattern = re.escape(query.strip())
    overpass_query = f"""
    [out:json][timeout:20];
    (
      node["name"~"{name_pattern}",i](around:{radius},{lat},{lon});
      way["name"~"{name_pattern}",i](around:{radius},{lat},{lon});
      relation["name"~"{name_pattern}",i](around:{radius},{lat},{lon});
    );
    out center tags 100;
    """

    data = run_overpass_query(overpass_query)
    if data is None:
        return []

    places = []
    for element in data.get("elements", []):
        tags = element.get("tags", {})
        lat_value = element.get("lat", element.get("center", {}).get("lat"))
        lon_value = element.get("lon", element.get("center", {}).get("lon"))

        if lat_value is None or lon_value is None:
            continue

        places.append(
            {
                "id": element.get("id"),
                "name": tags.get("name", "Unknown"),
                "category": (
                    tags.get("amenity")
                    or tags.get("tourism")
                    or tags.get("shop")
                    or tags.get("leisure")
                    or tags.get("highway")
                    or "place"
                ),
                "lat": lat_value,
                "lon": lon_value,
                "address": format_address(tags),
            }
        )

    return places
