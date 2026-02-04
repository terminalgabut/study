# api/__init__.py

from .client import call_ai
from .generator import generate_quiz
from .prompts import BASE_SYSTEM_PROMPT

# Dengan ini, kamu bisa memanggil 'from api import call_ai' 
# dari folder manapun di luar folder api.
