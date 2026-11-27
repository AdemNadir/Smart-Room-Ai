import json
import httpx
import os
from typing import Optional, Dict, Any, List


class OllamaProvider:
    """
    Free local LLM provider backed by Ollama.
    Works offline after model download, no cloud API required.

    Config via environment variables:
    - OLLAMA_BASE_URL: Ollama server base URL (default: http://localhost:11434)
    - OLLAMA_MODEL: Ollama model name (default: llama3.2:1b)
    - OLLAMA_TEMPERATURE: sampling temperature (default: 0.3)
    - OLLAMA_TIMEOUT: timeout seconds (default: 30)
    """

    def __init__(self, base_url: str = None,
                 model: str = None, temperature: float = None,
                 timeout: int = None):
        self.base_url = (base_url or os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")).rstrip("/")
        self.model = model or os.environ.get("OLLAMA_MODEL", "llama3.2:1b")
        self.temperature = temperature or float(os.environ.get("OLLAMA_TEMPERATURE", 0.3))
        self.timeout = timeout or int(os.environ.get("OLLAMA_TIMEOUT", 30))
        self._client = httpx.Client(base_url=self.base_url, timeout=self.timeout)
        self.available = self._check_available()

    def _check_available(self) -> bool:
        try:
            resp = self._client.get("/api/tags", timeout=5)
            return resp.status_code == 200
        except Exception:
            return False

    def check_health(self) -> bool:
        """Returns True if Ollama server is reachable and model is ready."""
        if not self.available:
            return False
        try:
            resp = self._client.get("/api/generate", timeout=10)
            return resp.status_code == 200
        except Exception:
            return False

    def generate(self, prompt: str, system: Optional[str] = None,
                 temperature: Optional[float] = None,
                 max_tokens: Optional[int] = None) -> str:
        """Generate text from the local model. Falls back to empty string if model unavailable."""
        if not self.available:
            return ""

        payload: Dict[str, Any] = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
            "temperature": temperature if temperature is not None else self.temperature,
        }
        if system:
            payload["system"] = system
        if max_tokens:
            payload["num_predict"] = max_tokens

        try:
            resp = self._client.post("/api/generate", json=payload)
            resp.raise_for_status()
            data = resp.json()
            return data.get("response", "")
        except Exception as e:
            return f"[Error generating response: {e}]"

    def is_healthy(self) -> bool:
        return self.available