from dotenv import load_dotenv
from pathlib import Path
import os

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL")
OPENROUTESERVICE_API_KEY = os.getenv("OPENROUTESERVICE_API_KEY")

print("DATABASE_URL =", DATABASE_URL)
print("OPENROUTESERVICE_API_KEY Loaded =", bool(OPENROUTESERVICE_API_KEY))
