from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.ollama_service import OllamaService
from app.services.rag_service import RAGService

router = APIRouter()

ollama_service = OllamaService()
rag_service = RAGService()

class GenerateRequest(BaseModel):
    prompt: str
    model: Optional[str] = "llama3.1:8b"
    context: Optional[str] = None
    max_tokens: Optional[int] = 1000

class RAGQueryRequest(BaseModel):
    query: str
    user_id: int = 1
    bible_version: str = "NIV"
    max_results: int = 5

class SuggestionRequest(BaseModel):
    scripture_reference: str
    sermon_topic: Optional[str] = None
    user_id: int = 1

@router.post("/generate")
async def generate_text(request: GenerateRequest):
    """Generate text using Ollama LLM"""
    
    try:
        response = await ollama_service.generate(
            model=request.model,
            prompt=request.prompt,
            context=request.context,
            max_tokens=request.max_tokens
        )
        
        return {
            "success": True,
            "response": response["response"],
            "model": request.model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.post("/rag-query")
async def rag_query(request: RAGQueryRequest):
    """Query using RAG (Retrieval Augmented Generation)"""
    
    try:
        # Get relevant context from RAG
        context = await rag_service.search(
            query=request.query,
            user_id=request.user_id,
            max_results=request.max_results
        )
        
        # Generate response with context
        response = await ollama_service.generate_with_context(
            prompt=request.query,
            context=context
        )
        
        return {
            "success": True,
            "response": response["response"],
            "sources": context["sources"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG query failed: {str(e)}")


@router.post("/sermon-suggestions")
async def get_sermon_suggestions(request: SuggestionRequest):
    """Get AI-powered sermon suggestions"""
    
    try:
        # Build prompt for sermon suggestions
        prompt = f"""
        Based on the scripture reference {request.scripture_reference}, 
        provide sermon preparation suggestions including:
        1. Main themes
        2. Key points to cover
        3. Relevant cross-references
        4. Practical applications
        """
        
        if request.sermon_topic:
            prompt += f"\nSermon topic: {request.sermon_topic}"
        
        # Get context from RAG
        context = await rag_service.get_sermon_context(
            scripture_ref=request.scripture_reference,
            user_id=request.user_id
        )
        
        # Generate suggestions
        response = await ollama_service.generate_with_context(
            prompt=prompt,
            context=context
        )
        
        return {
            "success": True,
            "scripture_reference": request.scripture_reference,
            "suggestions": response["response"],
            "related_verses": context.get("related_verses", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")


@router.post("/hymn-suggestions")
async def get_hymn_suggestions(request: SuggestionRequest):
    """Get hymn suggestions based on sermon scripture"""
    
    try:
        # Search hymns related to scripture themes
        hymns = await rag_service.get_related_hymns(
            scripture_ref=request.scripture_reference,
            topic=request.sermon_topic
        )
        
        return {
            "success": True,
            "scripture_reference": request.scripture_reference,
            "suggested_hymns": hymns
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to suggest hymns: {str(e)}")


@router.post("/outline-generator")
async def generate_sermon_outline(request: SuggestionRequest):
    """Generate sermon outline from scripture reference"""
    
    try:
        prompt = f"""
        Create a detailed sermon outline for {request.scripture_reference}.
        
        Include:
        - Introduction with hook
        - 3-5 main points with supporting verses
        - Practical applications for each point
        - Conclusion with call to action
        
        Format as a structured outline with Roman numerals.
        """
        
        if request.sermon_topic:
            prompt += f"\nFocus on the theme: {request.sermon_topic}"
        
        # Get biblical context
        context = await rag_service.get_sermon_context(
            scripture_ref=request.scripture_reference,
            user_id=request.user_id
        )
        
        # Generate outline
        response = await ollama_service.generate_with_context(
            prompt=prompt,
            context=context
        )
        
        return {
            "success": True,
            "scripture_reference": request.scripture_reference,
            "outline": response["response"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Outline generation failed: {str(e)}")