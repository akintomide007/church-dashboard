"""
Teachings Database Loader
Load sermons, Bible studies, devotionals, and other teachings into the database
"""

import os
import sys
import psycopg2
import json
from pathlib import Path
from datetime import datetime

def get_db_connection():
    """Create database connection"""
    return psycopg2.connect(
        host=os.getenv('POSTGRES_HOST', 'localhost'),
        port=os.getenv('POSTGRES_PORT', '5432'),
        database=os.getenv('POSTGRES_DB', 'church_rag'),
        user=os.getenv('POSTGRES_USER', 'postgres'),
        password=os.getenv('POSTGRES_PASSWORD', 'password')
    )

def load_sample_teachings(conn):
    """Load sample teachings into database"""
    cursor = conn.cursor()
    
    sample_teachings = [
        {
            'title': 'The Love of Christ',
            'teacher': 'John Wesley',
            'teaching_type': 'sermon',
            'scripture_reference': 'John 3:16',
            'outline': '''
I. God's Love for the World
II. The Gift of His Son
III. Belief and Eternal Life
IV. Our Response to God's Love
            ''',
            'content': '''
God so loved the world that He gave His only begotten Son. This simple yet profound truth forms the foundation of the Christian faith. 

In this passage, we see:
1. The vastness of God's love - He loved the WORLD
2. The costliness of His love - He GAVE His Son
3. The accessibility of His love - WHOEVER believes
4. The promise of His love - Shall not perish but have ETERNAL LIFE

Let us respond to this love with grateful hearts and devoted lives.
            ''',
            'tags': ['salvation', 'love', 'gospel', 'evangelism'],
            'teaching_date': datetime(2024, 1, 7)
        },
        {
            'title': 'Walking by Faith',
            'teacher': 'Charles Spurgeon',
            'teaching_type': 'sermon',
            'scripture_reference': '2 Corinthians 5:7',
            'outline': '''
I. What is Faith?
II. The Contrast: Faith vs. Sight
III. Living by Faith Daily
IV. The Rewards of Faith
            ''',
            'content': '''
"For we walk by faith, not by sight." The Christian life is a walk of faith, trusting in God's promises even when circumstances seem contrary.

Walking by faith means:
- Trusting God's Word over our feelings
- Believing His promises despite circumstances
- Moving forward when we cannot see the path
- Resting in His character and faithfulness

Faith is not blind - it is based on the solid foundation of God's revealed Word and His unchanging character.
            ''',
            'tags': ['faith', 'trust', 'christian_living'],
            'teaching_date': datetime(2024, 2, 14)
        },
        {
            'title': 'The Fruit of the Spirit',
            'teacher': 'D.L. Moody',
            'teaching_type': 'bible_study',
            'scripture_reference': 'Galatians 5:22-23',
            'outline': '''
I. Introduction to Spiritual Fruit
II. Love - The Foundation
III. Joy and Peace
IV. Patience, Kindness, and Goodness
V. Faithfulness, Gentleness, and Self-Control
VI. Cultivating Fruit in Our Lives
            ''',
            'content': '''
The fruit of the Spirit represents the character of Christ formed in believers through the Holy Spirit's work.

Each aspect of the fruit:
- Love: Agape - selfless, sacrificial love
- Joy: Deep gladness rooted in God
- Peace: Tranquility and wholeness
- Patience: Long-suffering and endurance
- Kindness: Benevolence toward others
- Goodness: Moral excellence
- Faithfulness: Reliability and loyalty
- Gentleness: Meekness and humility
- Self-control: Mastery over desires

These are not produced by human effort but are the supernatural result of yielding to the Holy Spirit.
            ''',
            'tags': ['holy_spirit', 'character', 'sanctification', 'bible_study'],
            'teaching_date': datetime(2024, 3, 10)
        },
        {
            'title': 'Prayer: Our Vital Connection',
            'teacher': 'Andrew Murray',
            'teaching_type': 'devotional',
            'scripture_reference': 'Matthew 6:5-15',
            'outline': '''
I. The Priority of Prayer
II. Jesus' Model Prayer
III. Elements of Effective Prayer
IV. Hindrances to Prayer
V. The Power of Persistent Prayer
            ''',
            'content': '''
Prayer is the breath of the Christian life. Without it, we cannot survive spiritually.

Jesus taught us to pray with these elements:
- Adoration: "Our Father in heaven, hallowed be Your name"
- Submission: "Your kingdom come, Your will be done"
- Petition: "Give us this day our daily bread"
- Confession: "Forgive us our debts"
- Protection: "Lead us not into temptation"

Prayer is not about changing God's mind but aligning our hearts with His will. It is communion with our Creator, the lifeline of our faith.
            ''',
            'tags': ['prayer', 'devotional', 'spiritual_disciplines'],
            'teaching_date': datetime(2024, 4, 21)
        },
        {
            'title': 'The Good Shepherd',
            'teacher': 'George Mueller',
            'teaching_type': 'sermon',
            'scripture_reference': 'John 10:11-18',
            'outline': '''
I. Jesus: The Good Shepherd
II. The Shepherd Knows His Sheep
III. The Shepherd Lays Down His Life
IV. One Flock, One Shepherd
V. Our Response to the Shepherd
            ''',
            'content': '''
"I am the good shepherd. The good shepherd lays down his life for the sheep."

The shepherd metaphor reveals:
- Jesus' intimate knowledge of His people
- His protective care over us
- His sacrificial love - laying down His life
- His authority and leadership
- His provision for all our needs

As His sheep, we must:
- Listen to His voice
- Follow His leading
- Trust His care
- Rest in His protection
- Share His love with other sheep

The Good Shepherd never fails, never sleeps, and never abandons His flock.
            ''',
            'tags': ['jesus', 'salvation', 'care', 'protection'],
            'teaching_date': datetime(2024, 5, 19)
        }
    ]
    
    try:
        for teaching in sample_teachings:
            cursor.execute("""
                INSERT INTO teachings 
                (title, teacher, teaching_type, scripture_reference, outline, content, tags, teaching_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                teaching['title'],
                teaching['teacher'],
                teaching['teaching_type'],
                teaching['scripture_reference'],
                teaching['outline'],
                teaching['content'],
                teaching['tags'],
                teaching['teaching_date']
            ))
        
        conn.commit()
        print(f"Successfully loaded {len(sample_teachings)} sample teachings")
        
    except Exception as e:
        conn.rollback()
        print(f"Error loading teachings: {e}")
        raise
    finally:
        cursor.close()

def load_teachings_from_json(conn, filepath):
    """Load teachings from JSON file"""
    cursor = conn.cursor()
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            teachings = json.load(f)
        
        for teaching in teachings:
            # Parse date if present
            teaching_date = None
            if 'teaching_date' in teaching:
                teaching_date = datetime.fromisoformat(teaching['teaching_date'])
            
            cursor.execute("""
                INSERT INTO teachings 
                (user_id, title, teacher, teaching_type, scripture_reference, 
                 outline, content, audio_url, video_url, tags, teaching_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                teaching.get('user_id'),
                teaching['title'],
                teaching.get('teacher'),
                teaching.get('teaching_type', 'sermon'),
                teaching.get('scripture_reference'),
                teaching.get('outline'),
                teaching.get('content'),
                teaching.get('audio_url'),
                teaching.get('video_url'),
                teaching.get('tags', []),
                teaching_date
            ))
        
        conn.commit()
        print(f"Successfully loaded {len(teachings)} teachings from {filepath}")
        
    except Exception as e:
        conn.rollback()
        print(f"Error loading teachings from JSON: {e}")
        raise
    finally:
        cursor.close()

def main():
    """Main function to load teachings"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Load teachings into database')
    parser.add_argument('--sample', action='store_true', help='Load sample teachings')
    parser.add_argument('--file', type=str, help='Load from JSON file')
    
    args = parser.parse_args()
    
    conn = get_db_connection()
    
    try:
        if args.sample:
            load_sample_teachings(conn)
        elif args.file:
            load_teachings_from_json(conn, args.file)
        else:
            print("Please specify --sample or --file")
            parser.print_help()
            sys.exit(1)
            
    finally:
        conn.close()

if __name__ == '__main__':
    main()
