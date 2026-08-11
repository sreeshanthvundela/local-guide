from app.database.connection import engine
from app.models.base import Base

# Import models so SQLAlchemy registers them with Base
from app.models.business import Business
from app.models.category import Category
from app.models.city import City
from app.models.review import Review
from app.models.search_log import SearchLog
from app.models.user import User
from app.models.advertisement import Advertisement
from app.models.event import Event


def init_db():
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Database tables created successfully.")
