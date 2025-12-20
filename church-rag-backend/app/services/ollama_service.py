import aiohttp
from typing import Optional, Dict, Any
from app.core.config import settings

class OllamaService:
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.default_model = settings.OLLAMA_MODEL
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        context: Optional[str] = None,
        max_tokens: int = 1000,
        stream: bool = False
    ) -> Dict[str, Any]:
        """
        Generate text using Ollama
        """
        model = model or self.default_model
        
        # Build full prompt with context
        full_prompt = prompt
        if context:
            full_prompt = f"Context:\n{context}\n\nQuestion: {prompt}\n\nAnswer:"
        
        payload = {
            "model": model,
            "prompt": full_prompt,
            "stream": stream,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.7,
                "top_p": 0.9
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/api/generate",
                json=payload
            ) as response:
                if response.status != 200:
                    raise Exception(f"Ollama request failed: {response.status}")
                
                result = await response.json()
                return result
    
    async def generate_with_context(
        self,
        prompt: str,
        context: Dict[str, Any],
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate with structured context from RAG
        """
        # Format context
        context_text = self._format_context(context)
        
        return await self.generate(
            prompt=prompt,
            model=model,
            context=context_text
        )
    
    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format RAG context for the LLM"""
        formatted = []
        
        if "verses" in context:
            formatted.append("Scripture References:")
            for verse in context["verses"]:
                formatted.append(f"- {verse['reference']}: {verse['text']}")
        
        if "sermons" in context:
            formatted.append("\nRelated Sermon Content:")
            for sermon in context["sermons"]:
                formatted.append(f"- {sermon['title']}: {sermon['excerpt']}")
        
        if "documents" in context:
            formatted.append("\nRelevant Documents:")
            for doc in context["documents"]:
                formatted.append(f"- {doc['title']}: {doc['excerpt']}")
        
        return "\n".join(formatted)
    
    async def check_health(self) -> bool:
        """Check if Ollama is running"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/api/tags") as response:
                    return response.status == 200
        except:
            return False