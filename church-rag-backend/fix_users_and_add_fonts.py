#!/usr/bin/env python3
"""Fix users table and add font columns to slide_preferences"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.database import get_db_connection

print("Fixing users table and adding font selection...")
print("="*50)

try:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create default user if doesn't exist
    print("\n[1] Creating default user...")
    cursor.execute("""
        INSERT INTO users (id, email, full_name, hashed_password, church_name, role)
        VALUES (1, 'admin@church.local', 'Administrator', 'placeholder', 'Default Church', 'admin')
        ON CONFLICT (id) DO NOTHING
    """)
    cursor.execute("SELECT setval('users_id_seq', 1, true)")
    print("✓ Default user created/exists")
    
    # 2. Add font_name columns
    print("\n[2] Adding font selection columns...")
    font_columns = [
        ('songs_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
        ('hymns_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
        ('announcements_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
        ('uncategorized_font_name', "VARCHAR(100) DEFAULT 'Arial'"),
    ]
    
    for col_name, col_type in font_columns:
        try:
            cursor.execute(f"""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'slide_preferences' AND column_name = '{col_name}'
            """)
            exists = cursor.fetchone()
            
            if not exists:
                cursor.execute(f"ALTER TABLE slide_preferences ADD COLUMN {col_name} {col_type}")
                print(f"✓ Added column: {col_name}")
            else:
                print(f"✓ Column exists: {col_name}")
        except Exception as e:
            print(f"✗ Error with {col_name}: {e}")
    
    conn.commit()
    
    # 3. Verify
    print("\n[3] Verification:")
    cursor.execute("SELECT id, email FROM users WHERE id = 1")
    user = cursor.fetchone()
    print(f"✓ User: {user[1]} (ID: {user[0]})")
    
    cursor.execute("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'slide_preferences' 
        ORDER BY ordinal_position
    """)
    cols = [row[0] for row in cursor.fetchall()]
    print(f"✓ slide_preferences columns: {len(cols)}")
    font_cols = [c for c in cols if 'font' in c]
    print(f"✓ Font-related columns: {', '.join(font_cols)}")
    
    cursor.close()
    conn.close()
    
    print("\n" + "="*50)
    print("✅ Database fixed successfully!")
    print("\nYou can now:")
    print("  1. Save settings (user exists)")
    print("  2. Select fonts for each category")
    print("  3. Regenerate slides with custom fonts")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)
