from sentence_transformers import SentenceTransformer
from typing import List, Union
import numpy as np
from app.core.config import settings

class EmbeddingService:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load the embedding model"""
        try:
            print(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            print("Embedding model loaded successfully")
        except Exception as e:
            print(f"Error loading embedding model: {e}")
            raise
    
    async def encode(
        self,
        text: Union[str, List[str]],
        batch_size: int = 32
    ) -> Union[np.ndarray, List[np.ndarray]]:
        """
        Encode text into embeddings
        
        Args:
            text: Single string or list of strings
            batch_size: Batch size for processing
        
        Returns:
            Numpy array of embeddings (768 dimensions for all-mpnet-base-v2)
        """
        if not self.model:
            self._load_model()
        
        # Encode text
        embeddings = self.model.encode(
            text,
            batch_size=batch_size,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        
        return embeddings
    
    async def encode_batch(
        self,
        texts: List[str],
        batch_size: int = 32
    ) -> List[np.ndarray]:
        """Encode multiple texts in batches"""
        return await self.encode(texts, batch_size)
    
    def get_embedding_dimension(self) -> int:
        """Get the dimension of the embeddings"""
        return self.model.get_sentence_embedding_dimension()
    
    async def similarity(
        self,
        text1: str,
        text2: str
    ) -> float:
        """
        Calculate cosine similarity between two texts
        
        Returns:
            Similarity score between -1 and 1
        """
        embeddings = await self.encode([text1, text2])
        
        # Calculate cosine similarity
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        
        return float(similarity)