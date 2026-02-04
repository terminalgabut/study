import os
import requests
from typing import List, Dict, Any, Optional
from fastapi import APIRouter

router = APIRouter() # WAJIB ADA

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

def call_ai(messages: List[Dict[str, str]]):
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY belum diset di environment variable")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "openai/gpt-oss-120b:nitro",
        "messages": messages
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload
    )
    return response.json()
