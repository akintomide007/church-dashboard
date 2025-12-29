"""
Hymns Database Loader
Load traditional hymns into the database
"""

import os
import sys
import psycopg2
import json
from pathlib import Path

def get_db_connection():
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=os.getenv('POSTGRES_PORT', '5432'),
        database=os.getenv('POSTGRES_DB', 'church_rag'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'password')
    )

def load_sample_hymns(conn):
    cursor = conn.cursor()
    
    sample_hymns = [
        {
            'hymnal': 'Baptist Hymnal', 'number': 1, 'title': 'Holy, Holy, Holy',
            'first_line': 'Holy, holy, holy! Lord God Almighty!',
            'author': 'Reginald Heber', 'composer': 'John B. Dykes',
            'themes': ['worship', 'trinity', 'praise'],
            'scripture_references': ['Revelation 4:8', 'Isaiah 6:3']
        },
        {
            'hymnal': 'Baptist Hymnal', 'number': 15, 'title': 'Amazing Grace',
            'first_line': 'Amazing grace, how sweet the sound',
            'author': 'John Newton', 'composer': 'Traditional',
            'themes': ['grace', 'salvation', 'testimony'],
            'scripture_references': ['Ephesians 2:8-9', 'Titus 3:5']
        },
        {
            'hymnal': 'Baptist Hymnal', 'number': 30, 'title': 'How Great Thou Art',
            'first_line': 'O Lord my God, when I in awesome wonder',
            'author': 'Carl Boberg', 'composer': 'Stuart K. Hine',
            'themes': ['worship', 'creation', 'praise'],
            'scripture_references': ['Psalm 8', 'Psalm 19:1']
        },
        {
            'hymnal': 'Baptist Hymnal', 'number': 50, 'title': 'Great Is Thy Faithfulness',
            'first_line': 'Great is Thy faithfulness, O God my Father',
            'author': 'Thomas Chisholm', 'composer': 'William M. Runyan',
            'themes': ['faithfulness', 'providence', 'worship'],
            'scripture_references': ['Lamentations 3:22-23']
        },
        {
            'hymnal': 'Baptist Hymnal', 'number': 75, 'title': 'It Is Well with My Soul',
            'first_line': 'When peace like a river attendeth my way',
            'author': 'Horatio G. Spafford', 'composer': 'Philip P. Bliss',
            'themes': ['peace', 'trust', 'comfort'],
            'scripture_references': ['Romans 8:28', 'Philippians 4:7']
        }
    ]
    
    try:
        for hymn in sample_hymns:
            cursor.execute("""
                INSERT INTO hymns (hymnal, number, title, first_line, author, composer, themes, scripture_references)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (hymn['hymnal'], hymn['number'], hymn['title'], hymn['first_line'],
                  hymn['author'], hymn['composer'], hymn['themes'], hymn['scripture_references']))
        conn.commit()
        print(f"Loaded {len(sample_hymns)} sample hymns")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cursor.close()

def load_hymns_from_json(conn, filepath):
    cursor = conn.cursor()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            hymns = json.load(f)
        for hymn in hymns:
            cursor.execute("""
                INSERT INTO hymns (hymnal, number, title, first_line, lyrics, author, composer, themes, scripture_references)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (hymn.get('hymnal'), hymn.get('number'), hymn['title'], hymn.get('first_line'),
                  hymn.get('lyrics'), hymn.get('author'), hymn.get('composer'), 
                  hymn.get('themes', []), hymn.get('scripture_references', [])))
        conn.commit()
        print(f"Loaded {len(hymns)} hymns from {filepath}")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cursor.close()

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Load hymns into database')
    parser.add_argument('--sample', action='store_true', help='Load sample hymns')
    parser.add_argument('--file', type=str, help='Load from JSON file')
    args = parser.parse_args()
    
    conn = get_db_connection()
    try:
        if args.sample:
            load_sample_hymns(conn)
        elif args.file:
            load_hymns_from_json(conn, args.file)
        else:
            parser.print_help()
    finally:
        conn.close()

if __name__ == '__main__':
    main()
