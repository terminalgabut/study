// root/js/ui/generator.js
import { generateQuiz } from '../services/quizClient.js';
import { quizCore } from '../quiz/quizCore.js';
import { quizView } from '../../components/quizView.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn'); // [cite: 41]
  const quizEl = document.getElementById('quizSection'); // [cite: 41]
  const materiContainer = document.getElementById('materiContainer'); // [cite: 41]
  const pageEl = document.querySelector('.konten-page'); // 

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    // 1. Ambil Data (Materi & Judul Bab)
    const contentEl = document.getElementById('learningContent'); // [cite: 43]
    const titleEl = document.getElementById('learningTitle');
    
    const contentText = contentEl ? contentEl.textContent.trim() : ""; // [cite: 43]
    const currentCategory = titleEl ? titleEl.textContent.trim() : "Materi";

    // Validasi materi minimal [cite: 44]
    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // 2. Transisi UI sesuai rujukan [cite: 45]
    if (materiContainer) materiContainer.style.display = 'none';
    if (pageEl) pageEl.classList.add('show-quiz'); // Aktifkan kelas khusus kuis 
    
    quizEl.removeAttribute('hidden');
    quizEl.innerHTML = quizView.loading(); // Tampilkan placeholder loading [cite: 45]
    
    // Scroll ke judul agar fokus ke area kuis [cite: 44]
    if (titleEl) titleEl.scrollIntoView({ behavior: 'smooth' });

    try {
      // 3. Panggil API AI dengan slug dan order sesuai rujukan [cite: 46, 47]
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug') || "default";

      const result = await generateQuiz({
        materi: contentText,
        category: currentCategory,
        slug: slug,
        order: 1 // Mengikuti parameter rujukan 
      });

      if (result && result.quiz) {
        // 4. Inisialisasi Kuis Modular
        // Mengirimkan result.quiz (data utama) dan slug sesuai rujukan [cite: 48]
        quizCore.init(result.quiz, quizEl, currentCategory);
      } else {
        throw new Error("Format soal tidak valid.");
      }
    } catch (error) {
      console.error("Quiz Generator Error:", error); // 
      alert(`Gagal memuat kuis: ${error.message}`);
      
      // Rollback tampilan jika gagal 
      if (materiContainer) materiContainer.style.display = 'block';
      if (pageEl) pageEl.classList.remove('show-quiz');
      quizEl.innerHTML = `<p style="color:var(--accent); text-align:center; padding:20px;">Gagal memuat soal: ${error.message}</p>`;
    }
  };
}
