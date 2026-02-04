import os
import requests
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter

# Konfigurasi Router (Dibutuhkan oleh index.py)
router = APIRouter()

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# Sesuaikan model dengan yang tersedia di OpenRouter
DEFAULT_MODEL = "google/gemini-pro-1.5-exp" 

class AIClientError(Exception):
    pass

def call_ai(
    messages: List[Dict[str, str]],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.7,
    max_tokens: Optional[int] = None
) -> Dict[str, Any]:
    """
    Fungsi inti untuk memanggil API OpenRouter.
    """
    if not OPENROUTER_API_KEY:
        logging.error("OPENROUTER_API_KEY tidak ditemukan di environment variable")
        raise AIClientError("Konfigurasi API Key tidak ditemukan.")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://study-app.vercel.app", # Sesuaikan dengan domainmu
        "X-Title": "Study AI Generator"
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
        
        # Cek jika ada error dari server (4xx atau 5xx)
        response.raise_for_status()
        
        return response.json()

    except requests.exceptions.RequestException as e:
        logging.error(f"OpenRouter Connection Error: {str(e)}")
        raise AIClientError(f"Gagal terhubung ke layanan AI: {str(e)}")

# Endpoint opsional untuk cek status API via browser
@router.get("/api-status")
def check_api_status():
    if not OPENROUTER_API_KEY:
        return {"status": "error", "message": "API Key belum diset"}
    return {"status": "ready", "model": DEFAULT_MODEL}
