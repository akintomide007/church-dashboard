"""
Songs Database Loader
Load contemporary worship songs into the database
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

def load_sample_songs(conn):
    cursor = conn.cursor()
    
    sample_songs = [
        {
            'title': '10,000 Reasons (Bless the Lord)',
            'artist': 'Matt Redman',
            'copyright_info': '© 2011 Thankyou Music',
            'ccli_number': '6016351',
            'themes': ['worship', 'praise', 'thanksgiving'],
            'scripture_references': ['Psalm 103:1-2'],
            'key_signature': 'G',
            'tempo': 'Moderate'
        },
        {
            'title': 'In Christ Alone',
            'artist': 'Keith Getty & Stuart Townend',
            'copyright_info': '© 2001 Thankyou Music',
            'ccli_number': '3350395',
            'themes': ['christ', 'salvation', 'assurance'],
            'scripture_references': ['1 Corinthians 3:11', 'Romans 8:1'],
            'key_signature': 'D',
            'tempo': 'Moderate'
        },
        {
            'title': 'How Great Is Our God',
            'artist': 'Chris Tomlin',
            'copyright_info': '© 2004 worshiptogether.com Songs',
            'ccli_number': '4348399',
            'themes': ['worship', 'majesty', 'trinity'],
            'scripture_references': ['Psalm 145:3', 'Isaiah 40:28'],
            'key_signature': 'C',
            'tempo': 'Moderate'
        },
        {
            'title': 'Oceans (Where Feet May Fail)',
            'artist': 'Hillsong UNITED',
            'copyright_info': '© 2013 Hillsong Music Publishing',
            'ccli_number': '6428767',
            'themes': ['faith', 'trust', 'surrender'],
            'scripture_references': ['Matthew 14:22-33'],
            'key_signature': 'D',
            'tempo': 'Slow/Moderate'
        },
        {
            'title': 'Cornerstone',
            'artist': 'Hillsong Worship',
            'copyright_info': '© 2012 Hillsong Music Publishing',
            'ccli_number': '6158927',
            'themes': ['christ', 'foundation', 'hope'],
            'scripture_references': ['1 Peter 2:6', 'Ephesians 2:20'],
            'key_signature': 'C',
            'tempo': 'Moderate'
        },
        {
            'title': 'Goodness of God',
            'artist': 'Bethel Music',
            'copyright_info': '© 2018 Bethel Music Publishing',
            'ccli_number': '7117726',
            'themes': ['faithfulness', 'goodness', 'testimony'],
            'scripture_references': ['Psalm 107:1', 'Lamentations 3:22-23'],
            'key_signature': 'D',
            'tempo': 'Moderate'
        },
        {
            'title': 'Way Maker',
            'artist': 'Sinach',
            'copyright_info': '© 2015 Sinach',
            'ccli_number': '7115744',
            'themes': ['miracles', 'promise', 'worship'],
            'scripture_references': ['Exodus 3:14', 'John 14:6'],
            'key_signature': 'Bb',
            'tempo': 'Moderate'
        },
        {
            'title': 'What A Beautiful Name',
            'artist': 'Hillsong Worship',
            'copyright_info': '© 2016 Hillsong Music Publishing',
            'ccli_number': '7068424',
            'themes': ['jesus', 'worship', 'resurrection'],
            'scripture_references': ['Philippians 2:9-11', 'Acts 4:12'],
            'key_signature': 'D',
            'tempo': 'Slow/Moderate'
        }
    ]
    
    try:
        for song in sample_songs:
            cursor.execute("""
                INSERT INTO songs (title, artist, copyright_info, ccli_number, themes, 
                                   scripture_references, key_signature, tempo)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (song['title'], song['artist'], song['copyright_info'], song['ccli_number'],
                  song['themes'], song['scripture_references'], song['key_signature'], song['tempo']))
        conn.commit()
        print(f"Loaded {len(sample_songs)} sample contemporary worship songs")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cursor.close()

def load_songs_from_json(conn, filepath):
    cursor = conn.cursor()
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            songs = json.load(f)
        for song in songs:
            cursor.execute("""
                INSERT INTO songs (title, artist, lyrics, copyright_info, ccli_number, 
                                   themes, scripture_references, key_signature, tempo)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (song['title'], song.get('artist'), song.get('lyrics'), 
                  song.get('copyright_info'), song.get('ccli_number'),
                  song.get('themes', []), song.get('scripture_references', []),
                  song.get('key_signature'), song.get('tempo')))
        conn.commit()
        print(f"Loaded {len(songs)} songs from {filepath}")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cursor.close()

def main():
    import argparse
    parser = argparse.ArgumentParser(description='Load contemporary worship songs into database')
    parser.add_argument('--sample', action='store_true', help='Load sample songs')
    parser.add_argument('--file', type=str, help='Load from JSON file')
    args = parser.parse_args()
    
    conn = get_db_connection()
    try:
        if args.sample:
            load_sample_songs(conn)
        elif args.file:
            load_songs_from_json(conn, args.file)
        else:
            parser.print_help()
    finally:
        conn.close()

if __name__ == '__main__':
    main()
