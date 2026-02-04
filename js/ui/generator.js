import { generateQuiz } from '../services/quizClient.js';

/**
 * Inisialisasi generator kuis
 */
export function initQuizGenerator() {
  const pageEl = document.querySelector('.konten-page');
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');

  if (!pageEl || !btnEl || !quizEl) {
    console.error("Elemen UI Quiz tidak ditemukan di DOM.");
    return;
  }

  btnEl.addEventListener('click', async () => {
    // 1. Tampilkan UI State
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');
    quizEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 2. Tampilkan Loading
    quizEl.innerHTML = `
      <h3>Latihan Soal</h3>
      <div class="loading-state">
        <p>Sedang menyusun soal kritis menggunakan AI...</p>
        <progress style="width: 100%"></progress>
      </div>
    `;

    // 3. Ambil Data dari Elemen Content & URL
    const contentEl = document.getElementById('learningContent');
    const content = contentEl ? contentEl.innerText : "";
    
    // Ambil data dari hash URL (#/kategori/slug)
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/');
    const category = parts[0] || 'Umum';
    const slug = parts[1] || 'default';

    try {
      // 4. Hit ke API Backend (/quiz)
      // Payload disesuaikan agar tidak memicu Error 422
      const result = await generateQuiz({
        materi: content,
        category: category,
        slug: slug,
        order: 1
      });

      // 5. Render Hasil
      // Sesuai index.py terbaru: data soal ada di dalam 'result.quiz'
      if (result && result.quiz) {
        renderQuiz(result.quiz, quizEl);
      } else {
        throw new Error("Format data dari server tidak sesuai (Missing 'quiz' object)");
      }

    } catch (err) {
      console.error("Quiz Error Detail:", err);
      quizEl.innerHTML = `
        <h3>Latihan Soal</h3>
        <div class="error-box" style="color: red; padding: 20px; border: 1px solid red; border-radius: 8px;">
          <p><strong>Gagal Memuat Soal</strong></p>
          <p>${err.message}</p>
          <button onclick="location.reload()" style="margin-top:10px;">Coba Lagi</button>
        </div>
      `;
    }
  });
}

/**
 * Merender data soal ke dalam kontainer HTML
 * @param {Object} data - Objek 'quiz' dari backend
 * @param {HTMLElement} container - Elemen tempat soal muncul
 */
function renderQuiz(data, container) {
  // Validasi apakah questions ada dan berbentuk array
  if (!data || !data.questions || !Array.isArray(data.questions)) {
    container.innerHTML = '<h3>Latihan Soal</h3><p>Maaf, tidak ada soal yang tersedia saat ini.</p>';
    return;
  }

  let html = `
    <div class="quiz-header" style="margin-bottom: 20px;">
      <h3>Latihan Soal: ${data.category || 'Materi'}</h3>
      <p style="color: #666;">Pilihlah jawaban yang paling tepat berdasarkan materi.</p>
    </div>
  `;

  // Loop setiap soal
  data.questions.forEach((q, index) => {
    // Bangun opsi jawaban
    const optionsHtml = (q.options || []).map(opt => `
      <li style="margin: 10px 0;">
        <label style="display: flex; align-items: center; padding: 12px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: 0.3s;">
          <input type="radio" name="question-${index}" value="${opt.replace(/"/g, '&quot;')}" style="margin-right: 10px;">
          <span>${opt}</span>
        </label>
      </li>
    `).join('');

    html += `
      <div class="quiz-card" style="margin-bottom: 30px; background: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
        <p style="font-size: 1.1rem;"><strong>${index + 1}. ${q.question}</strong></p>
        <div style="margin-bottom: 10px;">
          <span style="font-size: 0.75rem; background: #e0f0ff; color: #007bff; padding: 3px 8px; border-radius: 5px;">
            Dimensi: ${q.dimension || 'Analisa'}
          </span>
        </div>
        <ul style="list-style: none; padding: 0;">
          ${optionsHtml}
        </ul>
      </div>
    `;
  });

  // Tombol aksi akhir
  html += `
    <div class="quiz-footer" style="margin-top: 20px; text-align: center;">
      <button id="checkAnswersBtn" style="padding: 15px 30px; background-color: #28a745; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 1rem;">
        Kirim & Cek Jawaban
      </button>
    </div>
  `;

  container.innerHTML = html;
}
