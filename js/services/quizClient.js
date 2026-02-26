// services/quizClient.js

const QUIZ_API_URL = 'https://studygabut.vercel.app/quiz';
const DEFAULT_TIMEOUT = 60000; // 60 detik

let pendingRequest = null;

export async function generateQuiz({ materi, slug, category, order = 1 }) {
  // Prevent duplicate request
  if (pendingRequest) return pendingRequest;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  const fetchPromise = fetch(QUIZ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      materi,
      slug,
      category,
      order
    }),
    signal: controller.signal
  })
    .then(async (res) => {
      clearTimeout(timeoutId);

      if (!res.ok) {
        let message = 'Quiz API error';
        try {
          const json = await res.json();
          message = json?.message || JSON.stringify(json);
        } catch {
          message = await res.text();
        }
        throw new Error(message);
      }

      return res.json();
    })
    .finally(() => {
      pendingRequest = null;
    });

  pendingRequest = fetchPromise;
  return fetchPromise;
}
