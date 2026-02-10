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
    const contentEl = document.getElementById('learningContent');
    const titleEl = document.getElementById('learningTitle');
    
    // Sekarang titleEl berisi JUDUL BAB (misal: "Majas Personifikasi")
    const babTitle = titleEl ? titleEl.textContent.trim() : "Materi";
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    // Ambil kategori dari URL atau data global jika perlu konteks pelajaran (misal: "Bahasa")
    // Format hash kita: #materi/bahasa/slug-bab
    const hashParts = window.location.hash.split('/');
    const currentCategory = hashParts[1] || "Umum"; 

    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // Transisi UI
    if (materiContainer) materiContainer.style.display = 'none';
    if (pageEl) pageEl.classList.add('show-quiz');
    
    quizEl.removeAttribute('hidden');
    quizEl.innerHTML = quizView.loading();
    
    if (titleEl) titleEl.scrollIntoView({ behavior: 'smooth' });

    try {
      // Ambil slug dari hash URL
      const slug = hashParts[2] || "default";

      const result = await generateQuiz({
        materi: contentText,
        category: currentCategory, // Mengirim "Bahasa" agar AI tahu konteksnya
        title: babTitle,           // Mengirim "Majas" agar judul kuis benar
        slug: slug
      });

      if (result && result.quiz) {
        // Inisialisasi dengan Judul Bab agar di UI Kuis tulisannya "Kuis: Majas"
        quizCore.init(result.quiz, quizEl, babTitle);
      } else {
        throw new Error("Format soal tidak valid.");
      }
    } catch (error) {
      console.error("Quiz Generator Error:", error);
      alert(`Gagal memuat kuis: ${error.message}`);
      
      if (materiContainer) materiContainer.style.display = 'block';
      if (pageEl) pageEl.classList.remove('show-quiz');
    }
  };
}
