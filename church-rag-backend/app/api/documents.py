from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
from pathlib import Path
from datetime import datetime
import mimetypes

router = APIRouter()

# Configure document storage path
DOCUMENTS_DIR = Path("documents")
DOCUMENTS_DIR.mkdir(exist_ok=True)

# Create folder structure
FOLDERS = {
    "sermons": DOCUMENTS_DIR / "Sermons",
    "notes": DOCUMENTS_DIR / "Notes",
    "audio": DOCUMENTS_DIR / "Audio Recordings",
    "images": DOCUMENTS_DIR / "Images",
    "other": DOCUMENTS_DIR / "Other"
}

# Ensure all folders exist
for folder in FOLDERS.values():
    folder.mkdir(exist_ok=True, parents=True)


class DocumentInfo(BaseModel):
    name: str
    folder: str
    size: int
    type: str
    modified: str
    path: str


class FolderInfo(BaseModel):
    name: str
    file_count: int
    total_size: int


class StatusResponse(BaseModel):
    status: str
    message: str


def get_file_size_str(size_bytes: int) -> str:
    """Convert bytes to human-readable size."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.1f} TB"


def get_file_type(filename: str) -> str:
    """Determine file type from extension."""
    ext = Path(filename).suffix.lower()
    type_mapping = {
        '.pdf': 'pdf',
        '.doc': 'docx',
        '.docx': 'docx',
        '.txt': 'text',
        '.mp3': 'audio',
        '.wav': 'audio',
        '.m4a': 'audio',
        '.jpg': 'image',
        '.jpeg': 'image',
        '.png': 'image',
        '.gif': 'image',
    }
    return type_mapping.get(ext, 'other')


def get_folder_for_type(file_type: str) -> str:
    """Determine folder based on file type."""
    type_to_folder = {
        'pdf': 'sermons',
        'docx': 'notes',
        'text': 'notes',
        'audio': 'audio',
        'image': 'images',
    }
    return type_to_folder.get(file_type, 'other')


@router.get("/folders", response_model=List[FolderInfo])
async def get_folders():
    """Get information about all document folders."""
    try:
        folder_info = []
        
        for folder_key, folder_path in FOLDERS.items():
            if not folder_path.exists():
                folder_path.mkdir(parents=True, exist_ok=True)
            
            files = list(folder_path.glob("*"))
            file_count = len([f for f in files if f.is_file()])
            total_size = sum(f.stat().st_size for f in files if f.is_file())
            
            folder_info.append(FolderInfo(
                name=folder_path.name,
                file_count=file_count,
                total_size=total_size
            ))
        
        return folder_info
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading folders: {str(e)}")


@router.get("/files", response_model=List[DocumentInfo])
async def list_documents(folder: Optional[str] = None):
    """List all documents or documents in a specific folder."""
    try:
        documents = []
        
        # Determine which folders to search
        if folder:
            folder_key = folder.lower().replace(" ", "_")
            search_paths = [FOLDERS.get(folder_key, DOCUMENTS_DIR / folder)]
        else:
            search_paths = list(FOLDERS.values())
        
        for folder_path in search_paths:
            if not folder_path.exists():
                continue
                
            for file_path in folder_path.glob("*"):
                if file_path.is_file():
                    stat = file_path.stat()
                    documents.append(DocumentInfo(
                        name=file_path.name,
                        folder=folder_path.name,
                        size=stat.st_size,
                        type=get_file_type(file_path.name),
                        modified=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        path=str(file_path.relative_to(DOCUMENTS_DIR))
                    ))
        
        # Sort by modified date (newest first)
        documents.sort(key=lambda x: x.modified, reverse=True)
        return documents
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing documents: {str(e)}")


@router.post("/upload", response_model=StatusResponse)
async def upload_document(
    file: UploadFile = File(...),
    folder: Optional[str] = None
):
    """Upload a document to the specified folder."""
    try:
        # Determine target folder
        if folder:
            folder_key = folder.lower().replace(" ", "_")
            target_folder = FOLDERS.get(folder_key, FOLDERS['other'])
        else:
            # Auto-determine folder based on file type
            file_type = get_file_type(file.filename)
            folder_key = get_folder_for_type(file_type)
            target_folder = FOLDERS[folder_key]
        
        # Create target path
        file_path = target_folder / file.filename
        
        # Check if file already exists
        if file_path.exists():
            # Add timestamp to make unique
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            name_parts = file.filename.rsplit('.', 1)
            if len(name_parts) == 2:
                new_name = f"{name_parts[0]}_{timestamp}.{name_parts[1]}"
            else:
                new_name = f"{file.filename}_{timestamp}"
            file_path = target_folder / new_name
        
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return StatusResponse(
            status="success",
            message=f"File '{file.filename}' uploaded successfully to {target_folder.name}"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")


@router.get("/download/{folder}/{filename}")
async def download_document(folder: str, filename: str):
    """Download a specific document."""
    try:
        # Find the file
        file_path = None
        for folder_path in FOLDERS.values():
            potential_path = folder_path / filename
            if potential_path.exists() and folder_path.name == folder:
                file_path = potential_path
                break
        
        if not file_path or not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Determine media type
        media_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type=media_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading file: {str(e)}")


@router.delete("/delete/{folder}/{filename}", response_model=StatusResponse)
async def delete_document(folder: str, filename: str):
    """Delete a specific document."""
    try:
        # Find and delete the file
        file_path = None
        for folder_path in FOLDERS.values():
            potential_path = folder_path / filename
            if potential_path.exists() and folder_path.name == folder:
                file_path = potential_path
                break
        
        if not file_path or not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path.unlink()
        
        return StatusResponse(
            status="success",
            message=f"File '{filename}' deleted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")


@router.post("/rename", response_model=StatusResponse)
async def rename_document(
    folder: str,
    old_name: str,
    new_name: str
):
    """Rename a document."""
    try:
        # Find the file
        file_path = None
        for folder_path in FOLDERS.values():
            potential_path = folder_path / old_name
            if potential_path.exists() and folder_path.name == folder:
                file_path = potential_path
                break
        
        if not file_path or not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Create new path
        new_path = file_path.parent / new_name
        
        if new_path.exists():
            raise HTTPException(status_code=400, detail="A file with that name already exists")
        
        file_path.rename(new_path)
        
        return StatusResponse(
            status="success",
            message=f"File renamed from '{old_name}' to '{new_name}'"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error renaming file: {str(e)}")


@router.get("/search", response_model=List[DocumentInfo])
async def search_documents(query: str):
    """Search for documents by name."""
    try:
        documents = []
        query_lower = query.lower()
        
        for folder_path in FOLDERS.values():
            if not folder_path.exists():
                continue
                
            for file_path in folder_path.glob("*"):
                if file_path.is_file() and query_lower in file_path.name.lower():
                    stat = file_path.stat()
                    documents.append(DocumentInfo(
                        name=file_path.name,
                        folder=folder_path.name,
                        size=stat.st_size,
                        type=get_file_type(file_path.name),
                        modified=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        path=str(file_path.relative_to(DOCUMENTS_DIR))
                    ))
        
        documents.sort(key=lambda x: x.modified, reverse=True)
        return documents
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching documents: {str(e)}")
