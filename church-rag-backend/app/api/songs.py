from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.core.database import get_db, redis_client
import json

router = APIRouter()

@router.get("/search")
async def search_songs(
    query: str = Query(..., description="Search by title, artist, or lyrics"),
    artist: Optional[str] = Query(None, description="Filter by artist"),
    tag: Optional[str] = Query(None, description="Filter by theme/tag"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Search contemporary worship songs"""
    
    cache_key = f"songs:search:{artist}:{tag}:{query}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Build dynamic query
    sql = """
        SELECT id, title, artist, ccli_number, themes, 
               scripture_references, key_signature, tempo
        FROM songs
        WHERE to_tsvector('english', title || ' ' || COALESCE(lyrics, '')) 
              @@ plainto_tsquery('english', :query)
    """
    
    params = {"query": query}
    
    if artist:
        sql += " AND LOWER(artist) LIKE LOWER(:artist)"
        params["artist"] = f"%{artist}%"
    
    if tag:
        sql += " AND :tag = ANY(themes)"
        params["tag"] = tag
    
    sql += " ORDER BY title LIMIT :limit"
    params["limit"] = limit
    
    results = db.execute(text(sql), params).fetchall()
    
    songs = [
        {
            "id": r[0],
            "title": r[1],
            "artist": r[2],
            "ccli_number": r[3],
            "themes": r[4] or [],
            "scripture_references": r[5] or [],
            "key_signature": r[6],
            "tempo": r[7]
        }
        for r in results
    ]
    
    response = {"songs": songs, "count": len(songs)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/{song_id}")
async def get_song(
    song_id: int,
    db: Session = Depends(get_db)
):
    """Get full song details including lyrics"""
    
    cache_key = f"song:{song_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, artist, lyrics, copyright_info, ccli_number,
               themes, scripture_references, key_signature, tempo, created_at
        FROM songs
        WHERE id = :song_id
    """)
    
    result = db.execute(sql, {"song_id": song_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Song not found")
    
    song = {
        "id": result[0],
        "title": result[1],
        "artist": result[2],
        "lyrics": result[3],
        "copyright_info": result[4],
        "ccli_number": result[5],
        "themes": result[6] or [],
        "scripture_references": result[7] or [],
        "key_signature": result[8],
        "tempo": result[9],
        "created_at": result[10].isoformat() if result[10] else None
    }
    
    redis_client.setex(cache_key, 3600, json.dumps(song))
    return song


@router.get("/by-artist/{artist}")
async def get_songs_by_artist(
    artist: str,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get songs by artist"""
    
    cache_key = f"songs:artist:{artist}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, ccli_number, themes, key_signature, tempo
        FROM songs
        WHERE LOWER(artist) LIKE LOWER(:artist)
        ORDER BY title
        LIMIT :limit
    """)
    
    results = db.execute(sql, {"artist": f"%{artist}%", "limit": limit}).fetchall()
    
    songs = [
        {
            "id": r[0],
            "title": r[1],
            "ccli_number": r[2],
            "themes": r[3] or [],
            "key_signature": r[4],
            "tempo": r[5]
        }
        for r in results
    ]
    
    response = {"artist": artist, "songs": songs, "count": len(songs)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/by-theme/{theme}")
async def get_songs_by_theme(
    theme: str,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get songs by theme/tag"""
    
    cache_key = f"songs:theme:{theme}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, artist, ccli_number, themes, key_signature
        FROM songs
        WHERE :theme = ANY(themes)
        ORDER BY title
        LIMIT :limit
    """)
    
    results = db.execute(sql, {"theme": theme, "limit": limit}).fetchall()
    
    songs = [
        {
            "id": r[0],
            "title": r[1],
            "artist": r[2],
            "ccli_number": r[3],
            "themes": r[4] or [],
            "key_signature": r[5]
        }
        for r in results
    ]
    
    response = {"theme": theme, "songs": songs, "count": len(songs)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/by-key/{key_signature}")
async def get_songs_by_key(
    key_signature: str,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get songs by key signature"""
    
    cache_key = f"songs:key:{key_signature}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, artist, ccli_number, tempo
        FROM songs
        WHERE UPPER(key_signature) = UPPER(:key_signature)
        ORDER BY title
        LIMIT :limit
    """)
    
    results = db.execute(sql, {"key_signature": key_signature, "limit": limit}).fetchall()
    
    songs = [
        {
            "id": r[0],
            "title": r[1],
            "artist": r[2],
            "ccli_number": r[3],
            "tempo": r[4]
        }
        for r in results
    ]
    
    response = {"key_signature": key_signature, "songs": songs, "count": len(songs)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/list")
async def list_songs(
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """List all songs with pagination"""
    
    sql = text("""
        SELECT id, title, artist, ccli_number, themes, key_signature, tempo
        FROM songs
        ORDER BY title
        LIMIT :limit OFFSET :offset
    """)
    
    results = db.execute(sql, {"limit": limit, "offset": offset}).fetchall()
    
    songs = [
        {
            "id": r[0],
            "title": r[1],
            "artist": r[2],
            "ccli_number": r[3],
            "themes": r[4] or [],
            "key_signature": r[5],
            "tempo": r[6]
        }
        for r in results
    ]
    
    # Get total count
    count_sql = text("SELECT COUNT(*) FROM songs")
    total = db.execute(count_sql).scalar()
    
    return {
        "songs": songs,
        "count": len(songs),
        "total": total,
        "offset": offset,
        "limit": limit
    }


@router.get("/themes")
async def get_all_themes(db: Session = Depends(get_db)):
    """Get all unique themes/tags used in songs"""
    
    cached = redis_client.get("songs:themes:all")
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT DISTINCT unnest(themes) as theme
        FROM songs
        WHERE themes IS NOT NULL
        ORDER BY theme
    """)
    
    results = db.execute(sql).fetchall()
    themes = [r[0] for r in results]
    
    response = {"themes": themes, "count": len(themes)}
    redis_client.setex("songs:themes:all", 3600, json.dumps(response))
    
    return response
