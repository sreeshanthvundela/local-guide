from datetime import datetime


def get_recommendations():

    hour = datetime.now().hour

    if 5 <= hour < 11:
        return {
            "time": "Morning",
            "recommended_categories": [
                "cafe",
                "restaurant"
            ]
        }

    elif 11 <= hour < 18:
        return {
            "time": "Afternoon",
            "recommended_categories": [
                "restaurant",
                "bank",
                "atm"
            ]
        }

    else:
        return {
            "time": "Night",
            "recommended_categories": [
                "hospital",
                "pharmacy"
            ]
        }