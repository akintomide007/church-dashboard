from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from app.core.database import get_db, redis_client
import json

router = APIRouter()

@router.get("/search")
async def search_teachings(
    query: str = Query(..., description="Search by title, teacher, or content"),
    teaching_type: Optional[str] = Query(None, description="Filter by type: sermon, bible_study, devotional"),
    teacher: Optional[str] = Query(None, description="Filter by teacher"),
    tag: Optional[str] = Query(None, description="Filter by tag"),
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Search teachings by title, teacher, content, or tags"""
    
    cache_key = f"teachings:search:{teaching_type}:{teacher}:{tag}:{query}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Build dynamic query
    sql = """
        SELECT id, title, teacher, teaching_type, scripture_reference, 
               tags, teaching_date, created_at
        FROM teachings
        WHERE to_tsvector('english', title || ' ' || COALESCE(content, '')) 
              @@ plainto_tsquery('english', :query)
    """
    
    params = {"query": query}
    
    if teaching_type:
        sql += " AND teaching_type = :teaching_type"
        params["teaching_type"] = teaching_type
    
    if teacher:
        sql += " AND LOWER(teacher) LIKE LOWER(:teacher)"
        params["teacher"] = f"%{teacher}%"
    
    if tag:
        sql += " AND :tag = ANY(tags)"
        params["tag"] = tag
    
    sql += " ORDER BY teaching_date DESC NULLS LAST, created_at DESC LIMIT :limit"
    params["limit"] = limit
    
    results = db.execute(text(sql), params).fetchall()
    
    teachings = [
        {
            "id": r[0],
            "title": r[1],
            "teacher": r[2],
            "teaching_type": r[3],
            "scripture_reference": r[4],
            "tags": r[5] or [],
            "teaching_date": r[6].isoformat() if r[6] else None,
            "created_at": r[7].isoformat() if r[7] else None
        }
        for r in results
    ]
    
    response = {"teachings": teachings, "count": len(teachings)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/{teaching_id}")
async def get_teaching(
    teaching_id: int,
    db: Session = Depends(get_db)
):
    """Get full teaching details"""
    
    cache_key = f"teaching:{teaching_id}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, teacher, teaching_type, scripture_reference,
               outline, content, audio_url, video_url, tags, teaching_date, created_at
        FROM teachings
        WHERE id = :teaching_id
    """)
    
    result = db.execute(sql, {"teaching_id": teaching_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Teaching not found")
    
    teaching = {
        "id": result[0],
        "title": result[1],
        "teacher": result[2],
        "teaching_type": result[3],
        "scripture_reference": result[4],
        "outline": result[5],
        "content": result[6],
        "audio_url": result[7],
        "video_url": result[8],
        "tags": result[9] or [],
        "teaching_date": result[10].isoformat() if result[10] else None,
        "created_at": result[11].isoformat() if result[11] else None
    }
    
    redis_client.setex(cache_key, 3600, json.dumps(teaching))
    return teaching


@router.get("/by-type/{teaching_type}")
async def get_teachings_by_type(
    teaching_type: str,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get teachings by type (sermon, bible_study, devotional, etc.)"""
    
    cache_key = f"teachings:type:{teaching_type}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, teacher, scripture_reference, tags, teaching_date
        FROM teachings
        WHERE teaching_type = :teaching_type
        ORDER BY teaching_date DESC NULLS LAST, created_at DESC
        LIMIT :limit
    """)
    
    results = db.execute(sql, {"teaching_type": teaching_type, "limit": limit}).fetchall()
    
    teachings = [
        {
            "id": r[0],
            "title": r[1],
            "teacher": r[2],
            "scripture_reference": r[3],
            "tags": r[4] or [],
            "teaching_date": r[5].isoformat() if r[5] else None
        }
        for r in results
    ]
    
    response = {"teaching_type": teaching_type, "teachings": teachings, "count": len(teachings)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/by-tag/{tag}")
async def get_teachings_by_tag(
    tag: str,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get teachings by tag"""
    
    cache_key = f"teachings:tag:{tag}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, teacher, teaching_type, scripture_reference, teaching_date
        FROM teachings
        WHERE :tag = ANY(tags)
        ORDER BY teaching_date DESC NULLS LAST, created_at DESC
        LIMIT :limit
    """)
    
    results = db.execute(sql, {"tag": tag, "limit": limit}).fetchall()
    
    teachings = [
        {
            "id": r[0],
            "title": r[1],
            "teacher": r[2],
            "teaching_type": r[3],
            "scripture_reference": r[4],
            "teaching_date": r[5].isoformat() if r[5] else None
        }
        for r in results
    ]
    
    response = {"tag": tag, "teachings": teachings, "count": len(teachings)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/by-teacher/{teacher}")
async def get_teachings_by_teacher(
    teacher: str,
    limit: int = Query(20, le=100),
    db: Session = Depends(get_db)
):
    """Get teachings by teacher name"""
    
    cache_key = f"teachings:teacher:{teacher}:{limit}"
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    sql = text("""
        SELECT id, title, teaching_type, scripture_reference, tags, teaching_date
        FROM teachings
        WHERE LOWER(teacher) LIKE LOWER(:teacher)
        ORDER BY teaching_date DESC NULLS LAST, created_at DESC
        LIMIT :limit
    """)
    
    results = db.execute(sql, {"teacher": f"%{teacher}%", "limit": limit}).fetchall()
    
    teachings = [
        {
            "id": r[0],
            "title": r[1],
            "teaching_type": r[2],
            "scripture_reference": r[3],
            "tags": r[4] or [],
            "teaching_date": r[5].isoformat() if r[5] else None
        }
        for r in results
    ]
    
    response = {"teacher": teacher, "teachings": teachings, "count": len(teachings)}
    redis_client.setex(cache_key, 1800, json.dumps(response))
    
    return response


@router.get("/list")
async def list_teachings(
    limit: int = Query(20, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """List all teachings with pagination"""
    
    sql = text("""
        SELECT id, title, teacher, teaching_type, scripture_reference, tags, teaching_date
        FROM teachings
        ORDER BY teaching_date DESC NULLS LAST, created_at DESC
        LIMIT :limit OFFSET :offset
    """)
    
    results = db.execute(sql, {"limit": limit, "offset": offset}).fetchall()
    
    teachings = [
        {
            "id": r[0],
            "title": r[1],
            "teacher": r[2],
            "teaching_type": r[3],
            "scripture_reference": r[4],
            "tags": r[5] or [],
            "teaching_date": r[6].isoformat() if r[6] else None
        }
        for r in results
    ]
    
    # Get total count
    count_sql = text("SELECT COUNT(*) FROM teachings")
    total = db.execute(count_sql).scalar()
    
    return {
        "teachings": teachings,
        "count": len(teachings),
        "total": total,
        "offset": offset,
        "limit": limit
    }
