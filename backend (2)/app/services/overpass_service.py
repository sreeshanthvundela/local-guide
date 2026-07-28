import requests

OVERPASS_URL = "https://lz4.overpass-api.de/api/interpreter"

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
    out center tags;
    """

    try:
        response = requests.post(
            OVERPASS_URL,
            data={"data": query},
            headers={"User-Agent": "LocalGuide/1.0"},
            timeout=60,
        )

        print("STATUS:", response.status_code)

        if response.status_code != 200:
            print(response.text[:500])
            return []

        data = response.json()

    except Exception as e:
        print(e)
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
    out center tags;
    """

    try:
        response = requests.post(
            OVERPASS_URL,
            data={"data": query},
            headers={"User-Agent": "LocalGuide/1.0"},
            timeout=60,
        )

        if response.status_code != 200:
            return {"error": f"Overpass returned {response.status_code}"}

        data = response.json()

    except Exception as e:
        return {"error": str(e)}

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
      node["amenity"](around:{radius},{lat},{lon});
      way["amenity"](around:{radius},{lat},{lon});
      relation["amenity"](around:{radius},{lat},{lon});

      node["shop"](around:{radius},{lat},{lon});
      way["shop"](around:{radius},{lat},{lon});
      relation["shop"](around:{radius},{lat},{lon});

      node["tourism"](around:{radius},{lat},{lon});
      way["tourism"](around:{radius},{lat},{lon});
      relation["tourism"](around:{radius},{lat},{lon});

      node["leisure"](around:{radius},{lat},{lon});
      way["leisure"](around:{radius},{lat},{lon});
      relation["leisure"](around:{radius},{lat},{lon});
    );
    out center tags;
    """

    try:
        response = requests.post(
            OVERPASS_URL,
            data={"data": query},
            headers={"User-Agent": "LocalGuide/1.0"},
            timeout=60,
        )

        print("STATUS:", response.status_code)

        if response.status_code != 200:
            print(response.text[:500])
            return []

        data = response.json()
        print("STATUS:", response.status_code)
        print("ELEMENTS:", len(data.get("elements", [])))

    except Exception as e:
        print(e)
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
    """
    Search nearby places by category or name.
    """

    # First try treating the query as a category
    category_results = get_nearby_places(
        lat,
        lon,
        query.lower(),
        radius,
    )

    if category_results:
        return category_results

    # Otherwise search every nearby place by name
    services = get_all_nearby_services(lat, lon, radius)

    query = query.lower()

    return [
        place
        for place in services
        if query in place["name"].lower()
    ]
