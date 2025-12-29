"""
Bible Database Loader
Supports loading Bible versions from scrollmapper/bible_databases format
and other compatible SQL formats into the PostgreSQL database.
"""

import os
import sys
import psycopg2
import requests
import re
from pathlib import Path

# Bible version sources (scrollmapper-compatible format)
# NOTE: Files are in formats/psql/ directory for PostgreSQL
BIBLE_SOURCES = {
    'KJV': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/psql/KJV.sql',
        'code': 'KJV',
        'name': 'King James Version'
    },
    'ASV': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/sql/ASV.sql',
        'code': 'ASV',
        'name': 'American Standard Version'
    },
    'WEB': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/sql/WEB.sql',
        'code': 'WEB',
        'name': 'World English Bible'
    },
    'YLT': {
        'url': 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/sql/YLT.sql',
        'code': 'YLT',
        'name': 'Youngs Literal Translation'
    }
}

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=os.getenv('POSTGRES_PORT', '5432'),
        database=os.getenv('POSTGRES_DB', 'church_rag'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'password')
    )

def ensure_bible_version_exists(conn, version_code, version_name):
    """Ensure the Bible version exists in bible_versions table"""
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO bible_versions (version_code, full_name, language)
            VALUES (%s, %s, 'English')
            ON CONFLICT (version_code) DO UPDATE 
            SET full_name = EXCLUDED.full_name
            RETURNING id
        """, (version_code, version_name))
        version_id = cursor.fetchone()[0]
        conn.commit()
        return version_id
    except Exception as e:
        conn.rollback()
        print(f"Error ensuring version exists: {e}")
        raise
    finally:
        cursor.close()

def parse_scrollmapper_sql(sql_content, version_id):
    """
    Parse scrollmapper format SQL and extract Bible verses
    Returns list of tuples: (version_id, book, chapter, verse, text)
    """
    verses = []
    
    # Pattern 1: MySQL format - INSERT INTO `t_asv` VALUES (1,'Genesis',1,1,'text');
    mysql_pattern = r"INSERT INTO [`']?t_\w+[`']? VALUES \((\d+),'([^']+)',(\d+),(\d+),'([^']*)'\)"
    
    # Pattern 2: PostgreSQL COPY format - 1\tGenesis\t1\t1\ttext
    # This is used in psql/ directory files
    
    # Try MySQL pattern first
    for match in re.finditer(mysql_pattern, sql_content):
        book_id = match.group(1)
        book = match.group(2)
        chapter = int(match.group(3))
        verse = int(match.group(4))
        text = match.group(5).replace("\\'", "'").replace("\\n", "\n").replace("''", "'")
        
        verses.append((version_id, book, chapter, verse, text))
    
    # If no verses found, try PostgreSQL COPY format
    if not verses:
        # Look for COPY command and data between COPY and \.
        copy_match = re.search(r'COPY.*?FROM stdin;(.*?)\\\.', sql_content, re.DOTALL)
        if copy_match:
            copy_data = copy_match.group(1).strip()
            for line in copy_data.split('\n'):
                if not line.strip():
                    continue
                parts = line.split('\t')
                if len(parts) >= 5:
                    try:
                        book_id = parts[0]
                        book = parts[1]
                        chapter = int(parts[2])
                        verse = int(parts[3])
                        text = parts[4].replace('\\n', '\n').replace('\\t', '\t')
                        verses.append((version_id, book, chapter, verse, text))
                    except (ValueError, IndexError):
                        continue
    
    return verses

def load_bible_from_url(conn, version_code, url):
    """Download and load Bible version from URL"""
    print(f"Downloading {version_code} from {url}...")
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        sql_content = response.text
        
        print(f"Downloaded {len(sql_content)} bytes")
        
        # Get or create version ID
        version_name = BIBLE_SOURCES[version_code]['name']
        version_id = ensure_bible_version_exists(conn, version_code, version_name)
        
        print(f"Parsing SQL content for {version_code}...")
        verses = parse_scrollmapper_sql(sql_content, version_id)
        
        if not verses:
            print(f"No verses found in SQL content. Trying alternative parsing...")
            # Try alternative parsing methods if needed
            return False
        
        print(f"Found {len(verses)} verses. Inserting into database...")
        
        # Insert verses in batches
        cursor = conn.cursor()
        batch_size = 1000
        for i in range(0, len(verses), batch_size):
            batch = verses[i:i + batch_size]
            cursor.executemany("""
                INSERT INTO bible_text (version_id, book, chapter, verse, text)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (version_id, book, chapter, verse) DO UPDATE
                SET text = EXCLUDED.text
            """, batch)
            conn.commit()
            print(f"Inserted {min(i + batch_size, len(verses))}/{len(verses)} verses")
        
        cursor.close()
        print(f"Successfully loaded {version_code} with {len(verses)} verses")
        return True
        
    except requests.RequestException as e:
        print(f"Error downloading {version_code}: {e}")
        return False
    except Exception as e:
        conn.rollback()
        print(f"Error loading {version_code}: {e}")
        return False

def load_bible_from_file(conn, version_code, filepath):
    """Load Bible version from local SQL file"""
    print(f"Loading {version_code} from {filepath}...")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Get or create version ID
        version_name = BIBLE_SOURCES.get(version_code, {}).get('name', version_code)
        version_id = ensure_bible_version_exists(conn, version_code, version_name)
        
        print(f"Parsing SQL content for {version_code}...")
        verses = parse_scrollmapper_sql(sql_content, version_id)
        
        if not verses:
            print(f"No verses found in SQL content")
            return False
        
        print(f"Found {len(verses)} verses. Inserting into database...")
        
        # Insert verses in batches
        cursor = conn.cursor()
        batch_size = 1000
        for i in range(0, len(verses), batch_size):
            batch = verses[i:i + batch_size]
            cursor.executemany("""
                INSERT INTO bible_text (version_id, book, chapter, verse, text)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (version_id, book, chapter, verse) DO UPDATE
                SET text = EXCLUDED.text
            """, batch)
            conn.commit()
            print(f"Inserted {min(i + batch_size, len(verses))}/{len(verses)} verses")
        
        cursor.close()
        print(f"Successfully loaded {version_code} with {len(verses)} verses")
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"Error loading {version_code} from file: {e}")
        return False

def main():
    """Main function to load Bible versions"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Load Bible versions into database')
    parser.add_argument('--version', type=str, help='Specific version to load (KJV, ASV, WEB, YLT)')
    parser.add_argument('--all', action='store_true', help='Load all available versions')
    parser.add_argument('--file', type=str, help='Load from local SQL file')
    parser.add_argument('--code', type=str, help='Version code when loading from file')
    
    args = parser.parse_args()
    
    conn = get_db_connection()
    
    try:
        if args.file:
            if not args.code:
                print("Error: --code is required when loading from file")
                sys.exit(1)
            load_bible_from_file(conn, args.code, args.file)
        elif args.all:
            print("Loading all Bible versions...")
            for version_code, info in BIBLE_SOURCES.items():
                load_bible_from_url(conn, version_code, info['url'])
                print("")
        elif args.version:
            version_code = args.version.upper()
            if version_code not in BIBLE_SOURCES:
                print(f"Unknown version: {version_code}")
                print(f"Available versions: {', '.join(BIBLE_SOURCES.keys())}")
                sys.exit(1)
            load_bible_from_url(conn, version_code, BIBLE_SOURCES[version_code]['url'])
        else:
            print("Please specify --version, --all, or --file")
            parser.print_help()
            sys.exit(1)
            
    finally:
        conn.close()

if __name__ == '__main__':
    main()
