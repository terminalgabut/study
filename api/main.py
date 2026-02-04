import os
import requests


# =========================
# CONFIG
# =========================

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

DEFAULT_MODEL = "openai/gpt-oss-120b:nitro"


# =========================
# OPENROUTER CLIENT
# =========================

def call_openrouter(
    messages: list,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.4
) -> dict:
    """
    Kirim request ke OpenRouter.
    Tidak peduli isi prompt atau output.
    """

    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY belum diset")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://terminalgabut.github.io/study",
        "X-Title": "Study AI Engine"
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature
    }

    response = requests.post(
        OPENROUTER_API_URL,
        headers=headers,
        json=payload,
        timeout=60
    )

    response.raise_for_status()
    return response.json()
