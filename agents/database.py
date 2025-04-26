from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from models import Base
import uuid

# Replace with your actual database URL from appsettings.json
DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost:5432/Receipts"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Initialize the database
def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)

    # No initial data seeding
    session = SessionLocal()
    try:
        # Any additional initialization logic can go here
        pass
    finally:
        session.close()

# Call init_db() to initialize the database
init_db()
