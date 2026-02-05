// services/quizClient.js

export async function generateQuiz({ materi, slug, category }) { // Ubah 'content' jadi 'materi'
  const QUIZ_API_URL = 'https://studyai-one-eosin.vercel.app/quiz';
  
  const res = await fetch(QUIZ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      materi, // Sekarang sudah sesuai dengan yang dicari oleh index.py
      slug,
      category,
      order: 1 // Tambahkan default order jika perlu
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Quiz API error: ${text}`);
  }

  return res.json();
}
