// root/js/ui/generator.js
import { generateQuiz } from '../services/quizClient.js';
import { quizCore } from '../quiz/quizCore.js';
import { quizView } from '../../components/quizView.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');
  const pageEl = document.querySelector('.konten-page');

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    // 1. Ambil Data (Materi & Judul Bab)
    const contentEl = document.getElementById('learningContent');
    const titleEl = document.getElementById('learningTitle');
    
    const contentText = contentEl ? contentEl.textContent.trim() : "";
    const currentCategory = titleEl ? titleEl.textContent.trim() : "Umum";

    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // 2. Persiapan UI
    if (materiContainer) materiContainer.style.display = 'none';
    if (pageEl) pageEl.classList.add('show-quiz');
    
    quizEl.removeAttribute('hidden');
    quizEl.innerHTML = quizView.loading();
    
    if (titleEl) titleEl.scrollIntoView({ behavior: 'smooth' });

    try {
      // 3. Panggil API AI
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug') || "default";

      const result = await generateQuiz({
        materi: contentText,
        category: currentCategory,
        slug: slug
      });

      if (result && result.quiz) {
        // 4. Jalankan Logic Kuis (Oper ke Core)
        quizCore.init(result.quiz, quizEl, currentCategory);
      } else {
        throw new Error("Format soal tidak valid.");
      }
    } catch (error) {
      console.error("Quiz Generator Error:", error);
      alert("Gagal memuat kuis. Pastikan koneksi aman.");
      
      // Rollback tampilan jika gagal
      if (materiContainer) materiContainer.style.display = 'block';
      if (pageEl) pageEl.classList.remove('show-quiz');
    }
  };
}
