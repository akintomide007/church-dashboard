from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.core.database import get_db
import json

router = APIRouter()

class ProjectionStartRequest(BaseModel):
    listening_mode: str = "smart"  # off, smart, always

class ProjectionDisplayRequest(BaseModel):
    content_type: str  # verse or hymn
    content_reference: str
    version: Optional[str] = "NIV"

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.post("/start")
async def start_projection(
    request: ProjectionStartRequest,
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """Start a projection session"""
    
    # Check if user already has active session
    check_sql = """
        SELECT id FROM projection_sessions 
        WHERE user_id = :user_id AND is_active = true
    """
    existing = db.execute(check_sql, {"user_id": user_id}).fetchone()
    
    if existing:
        return {
            "success": False,
            "message": "Active session already exists",
            "session_id": existing[0]
        }
    
    # Create new session
    insert_sql = """
        INSERT INTO projection_sessions (user_id, listening_mode, is_active)
        VALUES (:user_id, :listening_mode, true)
        RETURNING id
    """
    
    result = db.execute(
        insert_sql,
        {"user_id": user_id, "listening_mode": request.listening_mode}
    )
    db.commit()
    
    session_id = result.fetchone()[0]
    
    return {
        "success": True,
        "session_id": session_id,
        "listening_mode": request.listening_mode,
        "message": "Projection session started"
    }


@router.post("/stop")
async def stop_projection(
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """Stop active projection session"""
    
    update_sql = """
        UPDATE projection_sessions 
        SET is_active = false, ended_at = :ended_at
        WHERE user_id = :user_id AND is_active = true
        RETURNING id
    """
    
    result = db.execute(
        update_sql,
        {"user_id": user_id, "ended_at": datetime.now()}
    )
    db.commit()
    
    session = result.fetchone()
    
    if not session:
        raise HTTPException(status_code=404, detail="No active session found")
    
    return {
        "success": True,
        "message": "Projection session stopped",
        "session_id": session[0]
    }


@router.get("/status")
async def get_projection_status(
    user_id: int = 1,  # TODO: Get from auth token
    db: Session = Depends(get_db)
):
    """Get current projection session status"""
    
    query = """
        SELECT id, listening_mode, started_at, is_active
        FROM projection_sessions
        WHERE user_id = :user_id AND is_active = true
    """
    
    result = db.execute(query, {"user_id": user_id}).fetchone()
    
    if not result:
        return {
            "is_active": False,
            "message": "No active session"
        }
    
    return {
        "is_active": True,
        "session_id": result[0],
        "listening_mode": result[1],
        "started_at": result[2]
    }


@router.post("/display")
async def display_content(
    request: ProjectionDisplayRequest,
    user_id: int = 1,
    db: Session = Depends(get_db)
):
    """Display verse or hymn on projection screen"""
    
    # Get active session
    session_query = """
        SELECT id FROM projection_sessions 
        WHERE user_id = :user_id AND is_active = true
    """
    session = db.execute(session_query, {"user_id": user_id}).fetchone()
    
    if not session:
        raise HTTPException(status_code=400, detail="No active projection session")
    
    session_id = session[0]
    
    # Log to projection history
    history_sql = """
        INSERT INTO projection_history (session_id, content_type, content_reference)
        VALUES (:session_id, :content_type, :content_reference)
    """
    
    db.execute(
        history_sql,
        {
            "session_id": session_id,
            "content_type": request.content_type,
            "content_reference": request.content_reference
        }
    )
    db.commit()
    
    # Broadcast to connected clients
    await manager.broadcast({
        "type": "display",
        "content_type": request.content_type,
        "content_reference": request.content_reference,
        "version": request.version
    })
    
    return {
        "success": True,
        "message": "Content displayed"
    }


@router.get("/history")
async def get_projection_history(
    user_id: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get recent projection history"""
    
    query = """
        SELECT ph.content_type, ph.content_reference, ph.displayed_at
        FROM projection_history ph
        JOIN projection_sessions ps ON ph.session_id = ps.id
        WHERE ps.user_id = :user_id
        ORDER BY ph.displayed_at DESC
        LIMIT :limit
    """
    
    results = db.execute(query, {"user_id": user_id, "limit": limit}).fetchall()
    
    history = [
        {
            "content_type": r[0],
            "content_reference": r[1],
            "displayed_at": r[2]
        }
        for r in results
    ]
    
    return {"history": history}


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time projection updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Receive messages from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Echo back or broadcast
            await manager.broadcast({
                "type": "update",
                "data": message
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)