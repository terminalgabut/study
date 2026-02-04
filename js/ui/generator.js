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
      <div class="quiz-loading-container">
        <p class="quiz-loading">Sedang menyusun soal kritis untukmu...</p>
        <small>Proses ini mungkin memakan waktu hingga 10 detik.</small>
      </div>
    `;

    // =========================
    // 3️⃣ AMBIL DATA DARI HALAMAN & URL
    // =========================
    const contentEl = document.getElementById('learningContent');
    if (!contentEl) {
        quizEl.innerHTML = `<p class="quiz-error">Error: Konten materi tidak ditemukan.</p>`;
        return;
    }

    const content = contentEl.innerText;

    // Ambil data dari hash: #/category/slug
    // Contoh: #/matematika/aljabar-dasar
    const hashParts = location.hash.replace(/^#\/?/, '').split('/');
    const category = hashParts[0] || 'Umum';
    const slug = hashParts[1] || 'default-slug';

    try {
      // =========================
      // 4️⃣ FETCH KE AI (VIA VERCEL)
      // =========================
      // DISESUAIKAN DENGAN SKEMA FastAPI (QuizRequest)
      const result = await generateQuiz({
        materi: content,    // Sesuai dengan backend: materi (string)
        category: category, // Sesuai dengan backend: category (string)
        slug: slug,         // Sesuai dengan backend: slug (string)
        order: 1            // Sesuai dengan backend: order (int)
      });

      // =========================
      // 5️⃣ RENDER HASIL
      // =========================
      renderQuiz(result, quizEl);

    } catch (err) {
      console.error("Quiz Error:", err);
      
      let errorMessage = "Gagal memuat soal.";
      if (err.message.includes("504")) {
          errorMessage = "Waktu habis (Timeout). Materi terlalu panjang atau server sibuk.";
      } else if (err.message.includes("422")) {
          errorMessage = "Format data salah (Validation Error).";
      }

      quizEl.innerHTML = `
        <h3>Latihan Soal</h3>
        <div class="quiz-error-box">
          <p>${errorMessage}</p>
          <button onclick="location.reload()" class="btn-retry">Coba Lagi</button>
        </div>
      `;
    }
  });
}

/* ===================================
   RENDER SOAL (DINAMIS UNTUK SEMUA SOAL)
=================================== */
function renderQuiz(data, container) {
  // Cek apakah data valid
  if (!data || !data.questions || data.questions.length === 0) {
    container.innerHTML = '<h3>Latihan Soal</h3><p>Maaf, AI gagal membuat soal yang valid. Coba refresh halaman.</p>';
    return;
  }

  // Render header hasil
  let htmlContent = `
    <div class="quiz-header">
        <h3>Latihan Soal: ${data.category || 'Materi'}</h3>
        <p>Selesaikan soal-soal di bawah ini:</p>
    </div>
  `;

  // Render semua soal yang dikirim AI
  data.questions.forEach((q, index) => {
    htmlContent += `
      <div class="quiz-question-item" style="margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
        <p class="question-text"><strong>${index + 1}. ${q.question}</strong></p>
        <div class="question-meta" style="font-size: 0.8rem; color: #666; margin-bottom: 10px;">
            Dimensi: ${q.dimension || 'Logika'}
        </div>
        <ul class="quiz-options" style="list-style: none; padding-left: 0;">
          ${q.options.map(opt => `
            <li style="margin: 8px 0;">
                <label style="cursor: pointer; display: block; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                    <input type="radio" name="question-${index}" value="${opt}"> ${opt}
                </label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });

  htmlContent += `<button class="btn-submit-quiz" id="checkAnswers">Kirim Jawaban</button>`;
  
  container.innerHTML = htmlContent;
}
