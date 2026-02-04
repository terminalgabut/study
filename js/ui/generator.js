import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const pageEl = document.querySelector('.konten-page');
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');

  if (!pageEl || !btnEl || !quizEl) return;

  btnEl.addEventListener('click', async () => {
    // 1. UI State & Reset
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');
    quizEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 2. Loading State (Gunakan string sederhana agar tidak bentrok sintaks)
    quizEl.innerHTML = '<h3>Latihan Soal</h3><p>Sedang menyusun soal... Mohon tunggu.</p>';

    // 3. Ambil Data
    const contentEl = document.getElementById('learningContent');
    const content = contentEl ? contentEl.innerText : "";
    
    // Ambil data dari hash URL secara aman
    const hash = window.location.hash.replace(/^#\/?/, '');
    const parts = hash.split('/');
    const category = parts[0] || 'Umum';
    const slug = parts[1] || 'default';

    try {
      // 4. Fetch ke API
      const result = await generateQuiz({
        materi: content,
        category: category,
        slug: slug,
        order: 1
      });

      // 5. Render
      renderQuiz(result, quizEl);

    } catch (err) {
      console.error("Quiz Error:", err);
      quizEl.innerHTML = '<h3>Latihan Soal</h3><p style="color:red;">Gagal memuat soal. Silakan coba lagi nanti.</p>';
    }
  });
}

function renderQuiz(data, container) {
  if (!data || !data.questions || data.questions.length === 0) {
    container.innerHTML = '<h3>Latihan Soal</h3><p>Soal tidak tersedia.</p>';
    return;
  }

  // Gunakan variabel untuk membangun HTML agar lebih bersih
  let html = `<h3>Latihan Soal: ${data.category}</h3>`;

  data.questions.forEach((q, index) => {
    const optionsHtml = q.options.map(opt => `
      <li style="margin: 8px 0;">
        <label style="display: block; padding: 10px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer;">
          <input type="radio" name="question-${index}" value="${opt}"> ${opt}
        </label>
      </li>
    `).join('');

    html += `
      <div class="quiz-item" style="margin-bottom: 20px;">
        <p><strong>${index + 1}. ${q.question}</strong></p>
        <ul style="list-style: none; padding: 0;">${optionsHtml}</ul>
      </div>
    `;
  });

  html += '<button id="checkAnswersBtn" style="margin-top: 10px; padding: 10px 20px;">Kirim Jawaban</button>';
  container.innerHTML = html;
}
