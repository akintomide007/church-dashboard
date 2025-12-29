"""
Universal Bible Versions Loader
Loads multiple Bible versions from scrollmapper repository
"""

import os
import psycopg2
import requests
import re

# Define Bible versions to load
BIBLE_VERSIONS = {
    'ASV': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/sql/ASV.sql',
        'name': 'American Standard Version',
        'format': 'mysql'
    },
    'WEB': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/sql/WEB.sql',
        'name': 'World English Bible',
        'format': 'mysql'
    },
    'YLT': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/sql/YLT.sql',
        'name': 'Youngs Literal Translation',
        'format': 'mysql'
    },
    'AKJV': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/sql/AKJV.sql',
        'name': 'Authorized King James Version',
        'format': 'mysql'
    }
}

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=os.getenv('POSTGRES_PORT', '5432'),
        database=os.getenv('POSTGRES_DB', 'church_rag'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'password')
    )

def convert_mysql_to_postgres(sql_content, version_code):
    """Convert MySQL SQL to PostgreSQL compatible format"""
    # Replace backticks with double quotes
    sql_content = sql_content.replace('`', '"')
    
    # Remove MySQL-specific stuff
    sql_content = re.sub(r'ENGINE=\w+\s+DEFAULT\s+CHARSET=\w+;', ';', sql_content)
    sql_content = re.sub(r'CHARACTER SET \w+', '', sql_content)
    sql_content = re.sub(r'COLLATE \w+', '', sql_content)
    
    # Handle AUTO_INCREMENT -> SERIAL
    sql_content = re.sub(r'"id"\s+INT\s+AUTO_INCREMENT', '"id" SERIAL', sql_content, flags=re.IGNORECASE)
    sql_content = re.sub(r'INT\s+AUTO_INCREMENT', 'SERIAL', sql_content, flags=re.IGNORECASE)
    
    # Remove IF NOT EXISTS in translations table (we'll handle that separately)
    sql_content = re.sub(r'WHERE NOT EXISTS.*?\);', ');', sql_content, flags=re.DOTALL)
    
    return sql_content

def load_version(version_code, version_info):
    """Load a single Bible version"""
    print(f"\n{'='*60}")
    print(f"Loading {version_code}: {version_info['name']}")
    print(f"{'='*60}")
    
    print(f"Step 1: Downloading {version_code}...")
    response = requests.get(version_info['url'], timeout=120)
    response.raise_for_status()
    sql_content = response.text
    print(f"✓ Downloaded {len(sql_content)} bytes")
    
    # Convert MySQL to PostgreSQL
    print("Step 2: Converting SQL format...")
    sql_content = convert_mysql_to_postgres(sql_content, version_code)
    print("✓ Converted to PostgreSQL format")
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        print("Step 3: Executing SQL...")
        # Execute in chunks to avoid issues
        statements = sql_content.split(';')
        for i, stmt in enumerate(statements):
            stmt = stmt.strip()
            if stmt and not stmt.startswith('--'):
                try:
                    cursor.execute(stmt)
                except Exception as e:
                    # Skip errors for translations table
                    if 'translations' not in stmt.lower():
                        raise
        conn.commit()
        print(f"✓ Created {version_code} tables")
        
        # Get or create version in our schema
        print("Step 4: Creating version entry...")
        cursor.execute("""
            INSERT INTO bible_versions (version_code, full_name, language)
            VALUES (%s, %s, 'English')
            ON CONFLICT (version_code) DO UPDATE 
            SET full_name = EXCLUDED.full_name
            RETURNING id
        """, (version_code, version_info['name']))
        version_id = cursor.fetchone()[0]
        conn.commit()
        print(f"✓ Version ID: {version_id}")
        
        # Transform data
        print("Step 5: Importing verses into bible_text...")
        books_table = f'"{version_code}_books"'
        verses_table = f'"{version_code}_verses"'
        
        cursor.execute(f"""
            INSERT INTO bible_text (version_id, book, chapter, verse, text)
            SELECT 
                %s as version_id,
                b.name as book,
                v.chapter,
                v.verse,
                v.text
            FROM {verses_table} v
            JOIN {books_table} b ON v.book_id = b.id
            ON CONFLICT (version_id, book, chapter, verse) DO UPDATE
            SET text = EXCLUDED.text
        """, (version_id,))
        
        rows_inserted = cursor.rowcount
        conn.commit()
        print(f"✓ Inserted {rows_inserted} verses")
        
        # Cleanup
        print("Step 6: Cleaning up temporary tables...")
        cursor.execute(f'DROP TABLE IF EXISTS {verses_table} CASCADE')
        cursor.execute(f'DROP TABLE IF EXISTS {books_table} CASCADE')
        cursor.execute('DROP TABLE IF EXISTS "translations" CASCADE')
        conn.commit()
        print("✓ Cleanup complete")
        
        # Verify
        cursor.execute("""
            SELECT COUNT(*) FROM bible_text WHERE version_id = %s
        """, (version_id,))
        count = cursor.fetchone()[0]
        
        print(f"\n🎉 SUCCESS: {version_code} loaded with {count} verses!")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ ERROR loading {version_code}: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

def main():
    """Load all Bible versions"""
    print("="*60)
    print("BIBLE VERSIONS LOADER")
    print("="*60)
    print(f"\nVersions to load: {', '.join(BIBLE_VERSIONS.keys())}")
    print("\nThis will take 5-10 minutes total...")
    
    results = {}
    for version_code, version_info in BIBLE_VERSIONS.items():
        success = load_version(version_code, version_info)
        results[version_code] = success
    
    # Final summary
    print("\n" + "="*60)
    print("FINAL SUMMARY")
    print("="*60)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT bv.version_code, bv.full_name, COUNT(bt.id) as verse_count
        FROM bible_versions bv
        LEFT JOIN bible_text bt ON bv.id = bt.version_id
        GROUP BY bv.id, bv.version_code, bv.full_name
        ORDER BY bv.version_code
    """)
    
    print("\n📚 All Bible Versions in Database:\n")
    for row in cursor.fetchall():
        status = "✅" if row[2] > 0 else "❌"
        print(f"  {status} {row[0]}: {row[1]} ({row[2]:,} verses)")
    
    cursor.close()
    conn.close()
    
    print("\n" + "="*60)
    print("✅ COMPLETE!")
    print("="*60)

if __name__ == '__main__':
    main()
