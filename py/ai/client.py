import os
import requests
from typing import Optional, List, Dict, Any

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

DEFAULT_MODEL = "openai/gpt-oss-120b"


class AIClientError(Exception):
    """Custom error untuk AI client"""
    pass


def call_ai(
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None
) -> Dict[str, Any]:
    """
    Panggil OpenRouter AI

    messages: format OpenAI messages
    model: model openrouter
    return: response JSON mentah
    """

    if not OPENROUTER_API_KEY:
        raise AIClientError("OPENROUTER_API_KEY belum diset")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://study.app",
        "X-Title": "Study AI"
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }

    if max_tokens is not None:
        payload["max_tokens"] = max_tokens

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=60
        )
    except requests.RequestException as e:
        raise AIClientError(f"Gagal koneksi ke OpenRouter: {e}")

    if response.status_code != 200:
        raise AIClientError(
            f"OpenRouter error {response.status_code}: {response.text}"
        )

    return response.json()
