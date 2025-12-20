import whisper
import numpy as np
from typing import Optional, Dict, Any
import asyncio
from app.core.config import settings

class WhisperService:
    def __init__(self):
        self.model_name = settings.WHISPER_MODEL
        self.model = None
        self._load_model()
    
    def _load_model(self):
        """Load Whisper model"""
        try:
            print(f"Loading Whisper model: {self.model_name}")
            self.model = whisper.load_model(self.model_name)
            print("Whisper model loaded successfully")
        except Exception as e:
            print(f"Error loading Whisper model: {e}")
            raise
    
    async def transcribe_audio(
        self,
        audio_path: str,
        language: str = "en",
        task: str = "transcribe"
    ) -> Dict[str, Any]:
        """
        Transcribe audio file
        
        Args:
            audio_path: Path to audio file
            language: Language code (default: English)
            task: "transcribe" or "translate"
        
        Returns:
            Dictionary with transcription results
        """
        if not self.model:
            self._load_model()
        
        # Run transcription in thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.model.transcribe(
                audio_path,
                language=language,
                task=task,
                fp16=False  # Set to True if using GPU
            )
        )
        
        return result
    
    async def transcribe_audio_chunk(
        self,
        audio_data: np.ndarray,
        sample_rate: int = 16000
    ) -> Dict[str, Any]:
        """
        Transcribe audio chunk for real-time processing
        
        Args:
            audio_data: Numpy array of audio samples
            sample_rate: Sample rate of audio
        
        Returns:
            Transcription result
        """
        if not self.model:
            self._load_model()
        
        # Ensure audio is correct format
        if audio_data.dtype != np.float32:
            audio_data = audio_data.astype(np.float32)
        
        # Normalize to [-1, 1] range
        if audio_data.max() > 1.0:
            audio_data = audio_data / 32768.0
        
        # Run transcription
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None,
            lambda: self.model.transcribe(
                audio_data,
                fp16=False
            )
        )
        
        return result
    
    async def detect_language(self, audio_path: str) -> str:
        """Detect language of audio"""
        if not self.model:
            self._load_model()
        
        # Load audio
        audio = whisper.load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)
        
        # Make log-Mel spectrogram
        mel = whisper.log_mel_spectrogram(audio).to(self.model.device)
        
        # Detect language
        _, probs = self.model.detect_language(mel)
        detected_language = max(probs, key=probs.get)
        
        return detected_language
    
    def extract_bible_references(self, text: str) -> list:
        """
        Extract Bible references from transcribed text
        
        Examples:
        - "turn to John 3:16"
        - "let's read Romans 8:28"
        - "first Corinthians chapter 13"
        """
        import re
        
        references = []
        
        # Pattern for book chapter:verse format
        # Matches: John 3:16, 1 John 2:1, Romans 8:28-30
        pattern = r'(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?(?:-(\d+))?'
        
        matches = re.finditer(pattern, text, re.IGNORECASE)
        
        for match in matches:
            book = match.group(1).strip()
            chapter = match.group(2)
            verse_start = match.group(3)
            verse_end = match.group(4)
            
            # Build reference
            ref = f"{book} {chapter}"
            if verse_start:
                ref += f":{verse_start}"
                if verse_end:
                    ref += f"-{verse_end}"
            
            references.append(ref)
        
        return references
    
    def extract_hymn_references(self, text: str) -> list:
        """
        Extract hymn references from text
        
        Examples:
        - "hymn 215"
        - "let's sing hymn number 342"
        - "Amazing Grace"
        """
        import re
        
        hymns = []
        
        # Pattern for hymn numbers
        number_pattern = r'hymn\s+(?:number\s+)?(\d+)'
        matches = re.finditer(number_pattern, text, re.IGNORECASE)
        
        for match in matches:
            hymns.append({
                "type": "number",
                "value": int(match.group(1))
            })
        
        # Common hymn titles (add more as needed)
        hymn_titles = [
            "Amazing Grace",
            "How Great Thou Art",
            "Holy Holy Holy",
            "It Is Well",
            "Great Is Thy Faithfulness"
        ]
        
        for title in hymn_titles:
            if title.lower() in text.lower():
                hymns.append({
                    "type": "title",
                    "value": title
                })
        
        return hymns