import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine, Session

# Load environment variables from a .env file if it exists
load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./maximize.db")

# SQLite requires check_same_thread=False
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
else:
    connect_args = {}

# Try to connect, fall back to SQLite if network/DNS resolution is offline
try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
    # Test the connection to ensure it works
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"Warning: PostgreSQL connection failed ({e}). Falling back to local SQLite database.")
    DATABASE_URL = "sqlite:///./maximize.db"
    connect_args = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
