from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.database import get_db

router = APIRouter()

class SermonCreate(BaseModel):
    title: Optional[str] = None
    scripture_reference: Optional[str] = None
    outline: Optional[str] = None
    notes: Optional[str] = None
    manuscript: Optional[str] = None
    sermon_date: Optional[datetime] = None

class SermonUpdate(BaseModel):
    title: Optional[str] = None
    scripture_reference: Optional[str] = None
    outline: Optional[str] = None
    notes: Optional[str] = None
    manuscript: Optional[str] = None
    sermon_date: Optional[datetime] = None

@router.post("/save")
async def save_sermon(
    sermon: SermonCreate,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """Save or update sermon draft"""
    
    query = """
        INSERT INTO sermons 
        (user_id, title, scripture_reference, outline, notes, manuscript, sermon_date)
        VALUES (:user_id, :title, :scripture_reference, :outline, :notes, :manuscript, :sermon_date)
        RETURNING id
    """
    
    result = db.execute(
        query,
        {
            "user_id": user_id,
            "title": sermon.title,
            "scripture_reference": sermon.scripture_reference,
            "outline": sermon.outline,
            "notes": sermon.notes,
            "manuscript": sermon.manuscript,
            "sermon_date": sermon.sermon_date
        }
    )
    db.commit()
    
    sermon_id = result.fetchone()[0]
    
    return {
        "success": True,
        "sermon_id": sermon_id,
        "message": "Sermon saved successfully"
    }


@router.get("/list")
async def get_sermons(
    user_id: int = 1,  # TODO: Get from auth token
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get user's sermons"""
    
    query = """
        SELECT id, title, scripture_reference, sermon_date, created_at, updated_at
        FROM sermons
        WHERE user_id = :user_id
        ORDER BY created_at DESC
        LIMIT :limit
    """
    
    results = db.execute(query, {"user_id": user_id, "limit": limit}).fetchall()
    
    sermons = [
        {
            "id": r[0],
            "title": r[1] or "Untitled Sermon",
            "scripture_reference": r[2],
            "sermon_date": r[3],
            "created_at": r[4],
            "updated_at": r[5]
        }
        for r in results
    ]
    
    return {"sermons": sermons}


@router.get("/{sermon_id}")
async def get_sermon(
    sermon_id: int,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """Get specific sermon"""
    
    query = """
        SELECT id, title, scripture_reference, outline, notes, manuscript, 
               sermon_date, created_at, updated_at
        FROM sermons
        WHERE id = :sermon_id AND user_id = :user_id
    """
    
    result = db.execute(query, {"sermon_id": sermon_id, "user_id": user_id}).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    return {
        "id": result[0],
        "title": result[1],
        "scripture_reference": result[2],
        "outline": result[3],
        "notes": result[4],
        "manuscript": result[5],
        "sermon_date": result[6],
        "created_at": result[7],
        "updated_at": result[8]
    }


@router.delete("/{sermon_id}")
async def delete_sermon(
    sermon_id: int,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """Delete sermon"""
    
    query = "DELETE FROM sermons WHERE id = :sermon_id AND user_id = :user_id"
    result = db.execute(query, {"sermon_id": sermon_id, "user_id": user_id})
    db.commit()
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Sermon not found")
    
    return {"success": True, "message": "Sermon deleted"}