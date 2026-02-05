import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizSection = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');
  const titleEl = document.getElementById('learningTitle');

  if (!btnEl || !quizSection) return;

  btnEl.onclick = async () => {
    const contentEl = document.getElementById('learningContent');
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // TRANSISI UI: Sembunyikan materi & Scroll ke atas
    if (materiContainer) materiContainer.classList.add('hidden');
    quizSection.classList.remove('hidden');
    quizSection.removeAttribute('hidden');
    titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const quizUI = document.getElementById('quiz-ui') || quizSection;
    quizUI.innerHTML = `
      <div class="flex flex-col items-center py-12">
import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');
  const pageEl = document.querySelector('.konten-page');

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    const contentEl = document.getElementById('learningContent');
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    if (!contentText) return;

    // --- INTERAKSI: TUTUP MATERI TOTAL ---
    if (materiContainer) materiContainer.style.display = 'none'; 
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');
    quizEl.scrollIntoView({ behavior: 'smooth' });

    quizEl.innerHTML = `<div class="quiz-placeholder"><p>Sedang menyusun soal...</p></div>`;

    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [category, slug] = hash.split('/');

      // Logic pengiriman tetap sama (tidak mengubah client)
      const result = await generateQuiz({
        materi: contentText, 
        category: category || "Umum",
        slug: slug || "default",
        order: 1
      });

      if (result && result.quiz) {
        renderQuizTampilanBaru(result.quiz, quizEl);
      }
    } catch (err) {
      if (materiContainer) materiContainer.style.display = 'block';
      quizEl.innerHTML = `<p style="color:red; text-align:center;">Gagal: ${err.message}</p>`;
    }
  };
}

function renderQuizTampilanBaru(data, container) {
  let html = `<h3 style="margin-bottom:20px;">Latihan Soal: ${data.category}</h3>`;
  
  // Menggunakan struktur item yang bersih namun tetap dengan CSS asli Anda
  data.questions.forEach((q, i) => {
    html += `
      <div class="quiz-item" style="margin-bottom:30px; padding:20px; border:1px solid rgba(255,255,255,0.1); border-radius:12px;">
        <p style="font-size:18px; margin-bottom:15px;"><strong>${i+1}. ${q.question}</strong></p>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${q.options.map(opt => `
            <label style="display:flex; align-items:center; padding:12px; border:1px solid rgba(255,255,255,0.05); border-radius:8px; cursor:pointer;">
              <input type="radio" name="q${i}" value="${opt}" style="margin-right:12px;"> 
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = `<div class="quiz-container">${html}</div>`;
}
