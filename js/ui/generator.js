import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const pageEl = document.querySelector('.konten-page');
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');

  if (!pageEl || !btnEl || !quizEl) return;

  btnEl.addEventListener('click', async () => {
    // =========================
    // 1️⃣ UI STATE
    // =========================
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');

    quizEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // =========================
    // 2️⃣ LOADING STATE
    // =========================
    quizEl.innerHTML = `
      <h3>Latihan Soal</h3>
      <p class="quiz-loading">Menyusun soal...</p>
    `;

    // =========================
    // 3️⃣ AMBIL DATA DARI HALAMAN
    // =========================
    const contentEl = document.getElementById('learningContent');
    if (!contentEl) return;

    const content = contentEl.innerText;

    // ambil dari hash: materi/category/slug
    const [, category, slug] = location.hash
      .replace(/^#\/?/, '')
      .split('/');

    try {
      // =========================
      // 4️⃣ FETCH KE AI (VIA VERCEL)
      // =========================
      const result = await generateQuiz({
        content,
        slug,
        category
      });

      // =========================
      // 5️⃣ RENDER HASIL (SIMPLE)
      // =========================
      renderQuiz(result, quizEl);

    } catch (err) {
      console.error(err);
      quizEl.innerHTML = `
        <h3>Latihan Soal</h3>
        <p class="quiz-error">Gagal memuat soal.</p>
      `;
    }
  });
}

/* ===================================
   RENDER SOAL (SENGAJA SEDERHANA)
=================================== */
function renderQuiz(data, container) {
  if (!data || !data.questions || !data.questions.length) {
    container.innerHTML = '<p>Tidak ada soal tersedia.</p>';
    return;
  }

  const q = data.questions[0]; // ⛔ sementara: soal pertama saja

  container.innerHTML = `
    <h3>Latihan Soal</h3>

    <div class="quiz-question">
      <p class="question-text">${q.question}</p>

      <ul class="quiz-options">
        ${q.options.map(opt => `<li>${opt}</li>`).join('')}
      </ul>
    </div>
  `;
}
