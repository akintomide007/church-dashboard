from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db, redis_client
import json

router = APIRouter()

@router.get("/search")
async def search_hymns(
    query: str = Query(..., description="Search by title, number, or theme"),
    hymnal: str = Query(None, description="Filter by hymnal"),
    db: Session = Depends(get_db)
):
    """Search hymns by title, number, or theme"""
    
    cache_key = f"hymns:search:{hymnal}:{query}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Check if query is a number
    if query.isdigit():
        # Search by hymn number
        sql = """
            SELECT id, hymnal, number, title, first_line, themes
            FROM hymns
            WHERE number = :query
        """
        if hymnal:
            sql += " AND hymnal = :hymnal"
            results = db.execute(sql, {"query": int(query), "hymnal": hymnal}).fetchall()
        else:
            results = db.execute(sql, {"query": int(query)}).fetchall()
    else:
        # Search by title or theme
        sql = """
            SELECT id, hymnal, number, title, first_line, themes
            FROM hymns
            WHERE to_tsvector('english', title || ' ' || COALESCE(first_line, '')) 
                  @@ plainto_tsquery('english', :query)
        """
        if hymnal:
            sql += " AND hymnal = :hymnal"
            results = db.execute(sql, {"query": query, "hymnal": hymnal}).fetchall()
        else:
            results = db.execute(sql, {"query": query}).fetchall()
    
    hymns = [
        {
            "id": r[0],
            "hymnal": r[1],
            "number": r[2],
            "title": r[3],
            "first_line": r[4],
            "themes": r[5] or []
        }
        for r in results
    ]
    
    response = {"hymns": hymns}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/{hymn_id}")
async def get_hymn(
    hymn_id: int,
    db: Session = Depends(get_db)
):
    """Get full hymn details including lyrics"""
    
    cache_key = f"hymn:{hymn_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = """
        SELECT id, hymnal, number, title, first_line, lyrics, 
               author, composer, themes, scripture_references
        FROM hymns
        WHERE id = :hymn_id
    """
    
    result = db.execute(sql, {"hymn_id": hymn_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Hymn not found")
    
    hymn = {
        "id": result[0],
        "hymnal": result[1],
        "number": result[2],
        "title": result[3],
        "first_line": result[4],
        "lyrics": result[5],
        "author": result[6],
        "composer": result[7],
        "themes": result[8] or [],
        "scripture_references": result[9] or []
    }
    
    redis_client.setex(cache_key, 3600, json.dumps(hymn))
    return hymn


@router.get("/by-theme/{theme}")
async def get_hymns_by_theme(
    theme: str,
    hymnal: str = Query(None),
    db: Session = Depends(get_db)
):
    """Get hymns by theme"""
    
    sql = """
        SELECT id, hymnal, number, title, themes
        FROM hymns
        WHERE :theme = ANY(themes)
    """
    
    if hymnal:
        sql += " AND hymnal = :hymnal"
        results = db.execute(sql, {"theme": theme, "hymnal": hymnal}).fetchall()
    else:
        results = db.execute(sql, {"theme": theme}).fetchall()
    
    hymns = [
        {
            "id": r[0],
            "hymnal": r[1],
            "number": r[2],
            "title": r[3],
            "themes": r[4]
        }
        for r in results
    ]
    
    return {"theme": theme, "hymns": hymns}