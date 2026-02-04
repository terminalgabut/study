from fastapi import FastAPI
import os
import requests

app = FastAPI()

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
        "model": "openai/gpt-4o-mini",
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
