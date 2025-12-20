"""
Script to initialize Qdrant vector database collections
Run this once to set up the vector database
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from app.core.config import settings
from app.services.embedding_service import EmbeddingService
import asyncio

async def initialize_collections():
    """Initialize Qdrant collections for Church RAG system"""
    
    # Connect to Qdrant
    client = QdrantClient(
        host=settings.QDRANT_HOST,
        port=settings.QDRANT_PORT
    )
    
    # Initialize embedding service to get dimension
    embedding_service = EmbeddingService()
    dimension = embedding_service.get_embedding_dimension()
    
    print(f"Embedding dimension: {dimension}")
    
    # Collection name
    collection_name = "church_content"
    
    # Check if collection exists
    try:
        collections = client.get_collections().collections
        collection_exists = any(c.name == collection_name for c in collections)
        
        if collection_exists:
            print(f"Collection '{collection_name}' already exists")
            response = input("Do you want to recreate it? (yes/no): ")
            if response.lower() == 'yes':
                client.delete_collection(collection_name)
                print(f"Deleted existing collection '{collection_name}'")
            else:
                print("Keeping existing collection")
                return
    except Exception as e:
        print(f"Error checking collections: {e}")
    
    # Create collection
    print(f"Creating collection '{collection_name}'...")
    
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(
            size=dimension,
            distance=Distance.COSINE
        )
    )
    
    print(f"✓ Collection '{collection_name}' created successfully")
    
    # Create payload indexes for faster filtering
    print("Creating payload indexes...")
    
    client.create_payload_index(
        collection_name=collection_name,
        field_name="user_id",
        field_schema="integer"
    )
    
    client.create_payload_index(
        collection_name=collection_name,
        field_name="content_type",
        field_schema="keyword"
    )
    
    client.create_payload_index(
        collection_name=collection_name,
        field_name="church_id",
        field_schema="integer"
    )
    
    print("✓ Payload indexes created")
    
    # Add some sample data
    print("\nAdding sample data...")
    
    sample_texts = [
        {
            "text": "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
            "reference": "John 3:16",
            "user_id": 1,
            "content_type": "verse",
            "church_id": 1
        },
        {
            "text": "The Lord is my shepherd, I lack nothing.",
            "reference": "Psalm 23:1",
            "user_id": 1,
            "content_type": "verse",
            "church_id": 1
        },
        {
            "text": "Amazing Grace, how sweet the sound, that saved a wretch like me.",
            "reference": "Hymn 215",
            "user_id": 1,
            "content_type": "hymn",
            "church_id": 1,
            "title": "Amazing Grace",
            "number": 215,
            "hymnal": "baptist-hymnal",
            "themes": ["grace", "salvation"]
        }
    ]
    
    points = []
    for idx, item in enumerate(sample_texts):
        # Generate embedding
        embedding = await embedding_service.encode(item["text"])
        
        # Create point
        point = PointStruct(
            id=idx + 1,
            vector=embedding.tolist(),
            payload=item
        )
        points.append(point)
    
    # Upload points
    client.upsert(
        collection_name=collection_name,
        points=points
    )
    
    print(f"✓ Added {len(points)} sample points")
    
    # Verify - FIXED VERSION
    try:
        collection_info = client.get_collection(collection_name)
        print(f"\n✓ Collection info:")
        print(f"  - Vectors count: {collection_info.vectors_count}")
        print(f"  - Points count: {collection_info.points_count}")
        print(f"  - Status: {collection_info.status}")
    except Exception as e:
        print(f"Note: Could not retrieve collection stats: {e}")
        print("Collection was created successfully anyway!")
    
    print("\n✅ Qdrant initialization complete!")

if __name__ == "__main__":
    asyncio.run(initialize_collections())