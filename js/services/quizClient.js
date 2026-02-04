const QUIZ_API_URL = 'https://pystudy-flame.vercel.app/quiz';
// ⚠️ ganti path jika endpoint kamu beda

/**
 * Generate quiz dari materi
 * @param {Object} payload
 * @param {string} payload.content   - isi materi (HTML / text)
 * @param {string} payload.slug      - slug bab
 * @param {string} payload.category  - kategori materi
 */
export async function generateQuiz({ content, slug, category }) {
  const res = await fetch(QUIZ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content,
      slug,
      category
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Quiz API error: ${text}`);
  }

  return res.json();
}
