#!/usr/bin/env python3
"""
Add vertical positioning and fix missing columns in slide_preferences table
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import get_db_connection

def update_database():
    """Add vertical_position and ensure font_name columns exist"""
    
    # Database connection
    conn = get_db_connection()
    
    cursor = conn.cursor()
    
    print("Adding missing columns to slide_preferences table...")
    
    # Add font_name columns if they don't exist
    font_columns = [
        ('songs_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
        ('hymns_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
        ('announcements_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
        ('uncategorized_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
    ]
    
    # Add vertical_position columns if they don't exist
    vertical_columns = [
        ('songs_vertical_position', "VARCHAR(20) DEFAULT 'center'"),
        ('hymns_vertical_position', "VARCHAR(20) DEFAULT 'center'"),
        ('announcements_vertical_position', "VARCHAR(20) DEFAULT 'center'"),
        ('uncategorized_vertical_position', "VARCHAR(20) DEFAULT 'center'"),
    ]
    
    all_columns = font_columns + vertical_columns
    
    for col_name, col_type in all_columns:
        try:
            cursor.execute(f"""
                ALTER TABLE slide_preferences 
                ADD COLUMN IF NOT EXISTS {col_name} {col_type}
            """)
            print(f"✓ Added column: {col_name}")
        except Exception as e:
            print(f"✗ Error adding {col_name}: {e}")
    
    conn.commit()
    
    # Verify columns exist
    cursor.execute("""
        SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_name = 'slide_preferences'
        ORDER BY column_name
    """)
    
    print("\n=== Current slide_preferences columns ===")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} (default: {row[2]})")
    
    cursor.close()
    conn.close()
    
    print("\n✓ Database updated successfully!")

if __name__ == "__main__":
    update_database()
