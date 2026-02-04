BASE_SYSTEM_PROMPT = """
Kamu adalah AI pembuat soal tes kritis tingkat menengah hingga tinggi.
Kamu HARUS patuh pada struktur dan aturan output.
"""

def build_quiz_prompt(materi: str, jumlah_soal: int = 10):
    return f"""
Buatkan {jumlah_soal} soal test IQ pilihan ganda berbasis teks berikut:

{materi}

ATURAN WAJIB:
1. Setiap soal HARUS fokus pada SATU dimensi kognitif berikut (URUTAN BOLEH ACAK):
   - Analisa
   - Logika
   - Pemecahan Masalah
   - Konsentrasi
   - Memori

2. Kembalikan HANYA JSON VALID tanpa teks di luar JSON.

3. Struktur JSON HARUS PERSIS seperti ini:

{{
  "questions": [
    {{
      "id": "q1",
      "category": "kategori-materi",
      "dimension": "Analisa | Logika | Pemecahan Masalah | Konsentrasi | Memori",
      "question": "soal kritis, jelas, dan relevan dengan materi",
      "options": ["opsi1", "opsi2", "opsi3", "opsi4"],
      "correct_answer": "teks yang PERSIS salah satu dari options"
    }}
  ]
}}

4. JANGAN gunakan huruf A/B/C/D.
5. JANGAN sertakan penjelasan atau teks tambahan.
6. Pastikan correct_answer SELALU cocok dengan salah satu options.
7. SETIAP soal HARUS menantang, kritis, dan bervariasi:
   - soal kecuali
   - soal logika implisit
   - soal cerita singkat
8. Gunakan tanda kutip yang benar, hindari escape rusak.
9. Nomor soal HARUS q1..q{jumlah_soal}.
"""
