from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import json
from pathlib import Path
from app.services.slide_service import (
    load_services,
    get_service,
    fetch_and_download,
    generate_slides,
    list_generated_slides
)
from app.core.database import get_db_connection

router = APIRouter()

class FetchRequest(BaseModel):
    service: str

class GenerateRequest(BaseModel):
    service: str

class ServiceInfo(BaseModel):
    name: str
    start_time: str
    drive_folder_id: str

class StatusResponse(BaseModel):
    status: str
    message: str

class SlideFile(BaseModel):
    filename: str
    service: str
    category: str
    path: str

@router.get("/services", response_model=List[ServiceInfo])
async def get_services():
    """Get all configured church services."""
    try:
        services = load_services()
        return services
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading services: {str(e)}")

@router.post("/fetch", response_model=StatusResponse)
async def fetch_files(request: FetchRequest):
    """Fetch files from Google Drive for a specific service."""
    try:
        service = get_service(request.service)
        if not service:
            raise HTTPException(status_code=404, detail=f"Service '{request.service}' not found")
        
        result = fetch_and_download(service)
        return StatusResponse(
            status="success",
            message=result
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching files: {str(e)}")

@router.post("/generate", response_model=StatusResponse)
async def generate_slides_endpoint(request: GenerateRequest):
    """Generate PowerPoint slides for a specific service."""
    try:
        result = generate_slides(request.service)
        return StatusResponse(
            status="success",
            message=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating slides: {str(e)}")

@router.get("/files", response_model=List[SlideFile])
async def get_generated_files():
    """Get list of all generated PowerPoint files."""
    try:
        files = list_generated_slides()
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")

@router.get("/files/{service}", response_model=List[SlideFile])
async def get_service_files(service: str):
    """Get list of generated PowerPoint files for a specific service."""
    try:
        files = list_generated_slides(service)
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


# Slide Preferences Models
class SlidePreferences(BaseModel):
    user_id: int = 1  # Default user for now (will be from auth later)
    songs_lines_per_slide: int = 6
    songs_font_size: int = 38
    songs_text_alignment: str = 'center'
    songs_font_name: str = 'Arial'
    songs_vertical_position: str = 'center'
    hymns_lines_per_slide: int = 8
    hymns_font_size: int = 34
    hymns_text_alignment: str = 'center'
    hymns_font_name: str = 'Arial'
    hymns_vertical_position: str = 'center'
    announcements_lines_per_slide: int = 10
    announcements_font_size: int = 28
    announcements_text_alignment: str = 'center'
    announcements_font_name: str = 'Arial'
    announcements_vertical_position: str = 'center'
    uncategorized_lines_per_slide: int = 8
    uncategorized_font_size: int = 32
    uncategorized_text_alignment: str = 'center'
    uncategorized_font_name: str = 'Arial'
    uncategorized_vertical_position: str = 'center'


# Available fonts for PowerPoint presentations
AVAILABLE_FONTS = [
    'Arial',
    'Arial Black',
    'Arial Narrow',
    'Calibri',
    'Calibri Light',
    'Cambria',
    'Candara',
    'Century Gothic',
    'Comic Sans MS',
    'Consolas',
    'Constantia',
    'Corbel',
    'Courier New',
    'Franklin Gothic Medium',
    'Garamond',
    'Georgia',
    'Impact',
    'Lucida Console',
    'Lucida Sans Unicode',
    'Palatino Linotype',
    'Segoe UI',
    'Segoe UI Light',
    'Tahoma',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
]


@router.get("/fonts", response_model=List[str])
async def get_available_fonts():
    """Get list of available fonts for slide generation."""
    return AVAILABLE_FONTS


@router.get("/preferences", response_model=SlidePreferences)
async def get_slide_preferences(user_id: int = 1):
    """Get slide preferences for a user. Returns defaults if not set."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT user_id, 
                   songs_lines_per_slide, songs_font_size, songs_text_alignment, songs_font_name, songs_vertical_position,
                   hymns_lines_per_slide, hymns_font_size, hymns_text_alignment, hymns_font_name, hymns_vertical_position,
                   announcements_lines_per_slide, announcements_font_size, announcements_text_alignment, announcements_font_name, announcements_vertical_position,
                   uncategorized_lines_per_slide, uncategorized_font_size, uncategorized_text_alignment, uncategorized_font_name, uncategorized_vertical_position
            FROM slide_preferences
            WHERE user_id = %s
        """, (user_id,))
        
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if result:
            return SlidePreferences(
                user_id=result[0],
                songs_lines_per_slide=result[1],
                songs_font_size=result[2],
                songs_text_alignment=result[3] or 'center',
                songs_font_name=result[4] or 'Arial',
                songs_vertical_position=result[5] or 'center',
                hymns_lines_per_slide=result[6],
                hymns_font_size=result[7],
                hymns_text_alignment=result[8] or 'center',
                hymns_font_name=result[9] or 'Arial',
                hymns_vertical_position=result[10] or 'center',
                announcements_lines_per_slide=result[11],
                announcements_font_size=result[12],
                announcements_text_alignment=result[13] or 'center',
                announcements_font_name=result[14] or 'Arial',
                announcements_vertical_position=result[15] or 'center',
                uncategorized_lines_per_slide=result[16],
                uncategorized_font_size=result[17],
                uncategorized_text_alignment=result[18] or 'center',
                uncategorized_font_name=result[19] or 'Arial',
                uncategorized_vertical_position=result[20] or 'center'
            )
        else:
            # Return defaults
            return SlidePreferences(user_id=user_id)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching preferences: {str(e)}")


@router.post("/preferences", response_model=StatusResponse)
async def save_slide_preferences(preferences: SlidePreferences):
    """Save slide preferences for a user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO slide_preferences (
                user_id, 
                songs_lines_per_slide, songs_font_size, songs_text_alignment, songs_font_name, songs_vertical_position,
                hymns_lines_per_slide, hymns_font_size, hymns_text_alignment, hymns_font_name, hymns_vertical_position,
                announcements_lines_per_slide, announcements_font_size, announcements_text_alignment, announcements_font_name, announcements_vertical_position,
                uncategorized_lines_per_slide, uncategorized_font_size, uncategorized_text_alignment, uncategorized_font_name, uncategorized_vertical_position,
                updated_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id) 
            DO UPDATE SET
                songs_lines_per_slide = EXCLUDED.songs_lines_per_slide,
                songs_font_size = EXCLUDED.songs_font_size,
                songs_text_alignment = EXCLUDED.songs_text_alignment,
                songs_font_name = EXCLUDED.songs_font_name,
                songs_vertical_position = EXCLUDED.songs_vertical_position,
                hymns_lines_per_slide = EXCLUDED.hymns_lines_per_slide,
                hymns_font_size = EXCLUDED.hymns_font_size,
                hymns_text_alignment = EXCLUDED.hymns_text_alignment,
                hymns_font_name = EXCLUDED.hymns_font_name,
                hymns_vertical_position = EXCLUDED.hymns_vertical_position,
                announcements_lines_per_slide = EXCLUDED.announcements_lines_per_slide,
                announcements_font_size = EXCLUDED.announcements_font_size,
                announcements_text_alignment = EXCLUDED.announcements_text_alignment,
                announcements_font_name = EXCLUDED.announcements_font_name,
                announcements_vertical_position = EXCLUDED.announcements_vertical_position,
                uncategorized_lines_per_slide = EXCLUDED.uncategorized_lines_per_slide,
                uncategorized_font_size = EXCLUDED.uncategorized_font_size,
                uncategorized_text_alignment = EXCLUDED.uncategorized_text_alignment,
                uncategorized_font_name = EXCLUDED.uncategorized_font_name,
                uncategorized_vertical_position = EXCLUDED.uncategorized_vertical_position,
                updated_at = CURRENT_TIMESTAMP
        """, (
            preferences.user_id,
            preferences.songs_lines_per_slide,
            preferences.songs_font_size,
            preferences.songs_text_alignment,
            preferences.songs_font_name,
            preferences.songs_vertical_position,
            preferences.hymns_lines_per_slide,
            preferences.hymns_font_size,
            preferences.hymns_text_alignment,
            preferences.hymns_font_name,
            preferences.hymns_vertical_position,
            preferences.announcements_lines_per_slide,
            preferences.announcements_font_size,
            preferences.announcements_text_alignment,
            preferences.announcements_font_name,
            preferences.announcements_vertical_position,
            preferences.uncategorized_lines_per_slide,
            preferences.uncategorized_font_size,
            preferences.uncategorized_text_alignment,
            preferences.uncategorized_font_name,
            preferences.uncategorized_vertical_position
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return StatusResponse(
            status="success",
            message="Slide preferences saved successfully"
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving preferences: {str(e)}")


@router.post("/preferences/reset", response_model=StatusResponse)
async def reset_slide_preferences(user_id: int = 1):
    """Reset slide preferences to defaults for a user."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM slide_preferences WHERE user_id = %s
        """, (user_id,))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return StatusResponse(
            status="success",
            message="Slide preferences reset to defaults"
        )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resetting preferences: {str(e)}")


@router.get("/download/{filename}")
async def download_slide_file(filename: str):
    """Download a generated PowerPoint slide file."""
    try:
        # Base directory for generated slides
        output_dir = Path("slide_content/output_pptx")
        
        # Security check: prevent directory traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            raise HTTPException(status_code=400, detail="Invalid filename")
        
        file_path = output_dir / filename
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        if not file_path.is_file():
            raise HTTPException(status_code=400, detail="Not a valid file")
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")
