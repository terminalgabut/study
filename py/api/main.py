from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import requests

app = FastAPI()

# =========================
# CORS (WAJIB untuk browser)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # boleh nanti dipersempit
    allow_credentials=True,
    allow_methods=["*"],       # POST, GET, OPTIONS
    allow_headers=["*"],
)

OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")

@app.get("/")
def health_check():
    return {"status": "AI API is running"}

@app.post("/call-ai")
def call_ai():
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "openai/gpt-oss-120b",
        "messages": [
            {"role": "user", "content": "Hello"}
        ]
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30
    )

    return response.json()
