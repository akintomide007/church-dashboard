"""
Load sample Bible verses for testing
"""
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import create_engine, text
from app.core.config import settings

def load_sample_data():
    """Load sample Bible verses"""
    
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        # Sample verses from popular passages
        sample_verses = [
            # John 3:16-17
            ("NIV", "John", 3, 16, "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."),
            ("NIV", "John", 3, 17, "For God did not send his Son into the world to condemn the world, but to save the world through him."),
            
            # Psalm 23:1-6
            ("NIV", "Psalm", 23, 1, "The Lord is my shepherd, I lack nothing."),
            ("NIV", "Psalm", 23, 2, "He makes me lie down in green pastures, he leads me beside quiet waters,"),
            ("NIV", "Psalm", 23, 3, "he refreshes my soul. He guides me along the right paths for his name's sake."),
            
            # Romans 8:28
            ("NIV", "Romans", 8, 28, "And we know that in all things God works for the good of those who love him, who have been called according to his purpose."),
            
            # Philippians 4:13
            ("NIV", "Philippians", 4, 13, "I can do all this through him who gives me strength."),
            
            # 1 Corinthians 13:4-8
            ("NIV", "1 Corinthians", 13, 4, "Love is patient, love is kind. It does not envy, it does not boast, it is not proud."),
            ("NIV", "1 Corinthians", 13, 13, "And now these three remain: faith, hope and love. But the greatest of these is love."),
        ]
        
        # Get version ID
        version_id_query = text("SELECT id FROM bible_versions WHERE version_code = :version")
        version_id = conn.execute(version_id_query, {"version": "NIV"}).fetchone()[0]
        
        # Insert verses
        insert_query = text("""
            INSERT INTO bible_text (version_id, book, chapter, verse, text)
            VALUES (:version_id, :book, :chapter, :verse, :text)
            ON CONFLICT (version_id, book, chapter, verse) DO NOTHING
        """)
        
        count = 0
        for verse in sample_verses:
            conn.execute(insert_query, {
                "version_id": version_id,
                "book": verse[1],
                "chapter": verse[2],
                "verse": verse[3],
                "text": verse[4]
            })
            count += 1
        
        conn.commit()
        
        print(f"✓ Loaded {count} sample verses")
        
        # Verify
        verify_query = text("SELECT COUNT(*) FROM bible_text")
        total = conn.execute(verify_query).fetchone()[0]
        print(f"✓ Total verses in database: {total}")

if __name__ == "__main__":
    print("Loading sample Bible data...")
    load_sample_data()
    print("✅ Sample data loaded successfully!")