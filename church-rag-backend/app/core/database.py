from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings
import redis
from qdrant_client import QdrantClient
import psycopg2
from urllib.parse import urlparse

# PostgreSQL
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """SQLAlchemy session for dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_db_connection():
    """Raw psycopg2 connection for direct SQL queries."""
    # Parse the DATABASE_URL to extract connection parameters
    url = urlparse(settings.DATABASE_URL)
    
    conn = psycopg2.connect(
        host=url.hostname,
        port=url.port or 5432,
        database=url.path[1:],  # Remove leading '/'
        user=url.username,
        password=url.password
    )
    return conn

# Redis
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

# Qdrant
qdrant_client = QdrantClient(
    host=settings.QDRANT_HOST,
    port=settings.QDRANT_PORT
)
