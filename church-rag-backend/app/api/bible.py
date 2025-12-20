from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.core.database import get_db, redis_client
import json

router = APIRouter()

@router.get("/search")
async def search_bible(
    query: str = Query(..., description="Verse reference or keyword"),
    version: str = Query("NIV", description="Bible version"),
    db: Session = Depends(get_db)
):
    """
    Search Bible by verse reference or keyword
    Examples: 
    - John 3:16
    - love
    - faith hope love
    """
    
    # Check cache first
    cache_key = f"bible:search:{version}:{query}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Parse verse reference (e.g., "John 3:16")
    result = parse_and_fetch_verse(query, version, db)
    
    if result:
        # Cache for 1 hour
        redis_client.setex(cache_key, 3600, json.dumps(result))
        return result
    
    raise HTTPException(status_code=404, detail="Verse not found")


@router.get("/verse/{book}/{chapter}/{verse}")
async def get_verse(
    book: str,
    chapter: int,
    verse: int,
    version: str = Query("NIV"),
    db: Session = Depends(get_db)
):
    """Get specific verse"""
    
    cache_key = f"bible:verse:{version}:{book}:{chapter}:{verse}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Query database
    query_sql = text("""
        SELECT bt.text, bv.version_code, bt.book, bt.chapter, bt.verse
        FROM bible_text bt
        JOIN bible_versions bv ON bt.version_id = bv.id
        WHERE bv.version_code = :version
        AND bt.book = :book
        AND bt.chapter = :chapter
        AND bt.verse = :verse
    """)
    
    result = db.execute(
        query_sql,
        {"version": version, "book": book, "chapter": chapter, "verse": verse}
    ).fetchone()
    
    if result:
        response = {
            "version": result[1],
            "book": result[2],
            "chapter": result[3],
            "verse": result[4],
            "text": result[0]
        }
        redis_client.setex(cache_key, 3600, json.dumps(response))
        return response
    
    raise HTTPException(status_code=404, detail="Verse not found")


@router.get("/chapter/{book}/{chapter}")
async def get_chapter(
    book: str,
    chapter: int,
    version: str = Query("NIV"),
    db: Session = Depends(get_db)
):
    """Get entire chapter"""
    
    cache_key = f"bible:chapter:{version}:{book}:{chapter}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    query_sql = text("""
        SELECT bt.verse, bt.text
        FROM bible_text bt
        JOIN bible_versions bv ON bt.version_id = bv.id
        WHERE bv.version_code = :version
        AND bt.book = :book
        AND bt.chapter = :chapter
        ORDER BY bt.verse
    """)
    
    results = db.execute(
        query_sql,
        {"version": version, "book": book, "chapter": chapter}
    ).fetchall()
    
    if results:
        verses = [{"verse": r[0], "text": r[1]} for r in results]
        response = {
            "version": version,
            "book": book,
            "chapter": chapter,
            "verses": verses
        }
        redis_client.setex(cache_key, 3600, json.dumps(response))
        return response
    
    raise HTTPException(status_code=404, detail="Chapter not found")


@router.get("/versions")
async def get_bible_versions(db: Session = Depends(get_db)):
    """Get all available Bible versions"""
    
    cached = redis_client.get("bible:versions")
    if cached:
        return json.loads(cached)
    
    query_sql = text("SELECT version_code, full_name FROM bible_versions")
    results = db.execute(query_sql).fetchall()
    
    versions = [{"code": r[0], "name": r[1]} for r in results]
    redis_client.setex("bible:versions", 86400, json.dumps(versions))
    
    return {"versions": versions}


def parse_and_fetch_verse(query: str, version: str, db: Session):
    """
    Parse verse reference and fetch from database
    Supports: John 3:16, John 3:16-17, 1 John 2:1
    """
    import re
    
    # Pattern: Book Chapter:Verse or Book Chapter:Verse-Verse
    pattern = r'(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?'
    match = re.match(pattern, query.strip(), re.IGNORECASE)
    
    if not match:
        return None
    
    book = match.group(1).strip().title()
    chapter = int(match.group(2))
    verse_start = int(match.group(3))
    verse_end = int(match.group(4)) if match.group(4) else verse_start
    
    # Query verses
    query_sql = text("""
        SELECT bt.verse, bt.text
        FROM bible_text bt
        JOIN bible_versions bv ON bt.version_id = bv.id
        WHERE bv.version_code = :version
        AND bt.book = :book
        AND bt.chapter = :chapter
        AND bt.verse BETWEEN :verse_start AND :verse_end
        ORDER BY bt.verse
    """)
    
    results = db.execute(
        query_sql,
        {
            "version": version,
            "book": book,
            "chapter": chapter,
            "verse_start": verse_start,
            "verse_end": verse_end
        }
    ).fetchall()
    
    if results:
        verses = [{"verse": r[0], "text": r[1]} for r in results]
        return {
            "version": version,
            "book": book,
            "chapter": chapter,
            "verses": verses
        }
    
    return None
