from typing import List, Dict, Any, Optional
from app.core.database import qdrant_client, get_db
from app.services.embedding_service import EmbeddingService
from qdrant_client.models import Filter, FieldCondition, MatchValue
from sqlalchemy.orm import Session

class RAGService:
    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.collection_name = "church_content"
    
    async def search(
        self,
        query: str,
        user_id: int,
        max_results: int = 5,
        filter_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Search across all user content using RAG
        """
        # Generate query embedding
        query_embedding = await self.embedding_service.encode(query)
        
        # Build filter
        search_filter = Filter(
            must=[
                FieldCondition(
                    key="user_id",
                    match=MatchValue(value=user_id)
                )
            ]
        )
        
        if filter_type:
            search_filter.must.append(
                FieldCondition(
                    key="content_type",
                    match=MatchValue(value=filter_type)
                )
            )
        
        # Search in Qdrant
        try:
            results = qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=search_filter,
                limit=max_results
            )
            
            # Format results
            sources = []
            for result in results:
                sources.append({
                    "content_type": result.payload.get("content_type"),
                    "reference": result.payload.get("reference"),
                    "text": result.payload.get("text"),
                    "score": result.score
                })
            
            return {
                "sources": sources,
                "query": query
            }
        except Exception as e:
            print(f"RAG search error: {e}")
            return {"sources": [], "query": query}
    
    async def get_sermon_context(
        self,
        scripture_ref: str,
        user_id: int
    ) -> Dict[str, Any]:
        """
        Get relevant context for sermon preparation
        """
        # Search for related verses, past sermons, and documents
        context = {
            "verses": await self._get_related_verses(scripture_ref),
            "sermons": await self._get_related_sermons(scripture_ref, user_id),
            "documents": await self._get_related_documents(scripture_ref, user_id)
        }
        
        return context
    
    async def _get_related_verses(
        self,
        scripture_ref: str,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Get cross-references and related verses"""
        # This would use your Bible database and semantic search
        # For now, return empty list
        return []
    
    async def _get_related_sermons(
        self,
        scripture_ref: str,
        user_id: int,
        max_results: int = 3
    ) -> List[Dict[str, Any]]:
        """Get user's past sermons on similar topics"""
        query_embedding = await self.embedding_service.encode(scripture_ref)
        
        try:
            results = qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=Filter(
                    must=[
                        FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                        FieldCondition(key="content_type", match=MatchValue(value="sermon"))
                    ]
                ),
                limit=max_results
            )
            
            sermons = []
            for result in results:
                sermons.append({
                    "title": result.payload.get("title"),
                    "excerpt": result.payload.get("text")[:200],
                    "score": result.score
                })
            
            return sermons
        except:
            return []
    
    async def _get_related_documents(
        self,
        scripture_ref: str,
        user_id: int,
        max_results: int = 3
    ) -> List[Dict[str, Any]]:
        """Get related documents and notes"""
        query_embedding = await self.embedding_service.encode(scripture_ref)
        
        try:
            results = qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=Filter(
                    must=[
                        FieldCondition(key="user_id", match=MatchValue(value=user_id)),
                        FieldCondition(key="content_type", match=MatchValue(value="document"))
                    ]
                ),
                limit=max_results
            )
            
            documents = []
            for result in results:
                documents.append({
                    "title": result.payload.get("title"),
                    "excerpt": result.payload.get("text")[:200],
                    "score": result.score
                })
            
            return documents
        except:
            return []
    
    async def get_related_hymns(
        self,
        scripture_ref: str,
        topic: Optional[str] = None,
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """Get hymns related to scripture or topic"""
        search_text = scripture_ref
        if topic:
            search_text = f"{scripture_ref} {topic}"
        
        query_embedding = await self.embedding_service.encode(search_text)
        
        try:
            results = qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=Filter(
                    must=[
                        FieldCondition(key="content_type", match=MatchValue(value="hymn"))
                    ]
                ),
                limit=max_results
            )
            
            hymns = []
            for result in results:
                hymns.append({
                    "title": result.payload.get("title"),
                    "number": result.payload.get("number"),
                    "hymnal": result.payload.get("hymnal"),
                    "themes": result.payload.get("themes", []),
                    "score": result.score
                })
            
            return hymns
        except:
            return []