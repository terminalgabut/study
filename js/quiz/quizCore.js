// root/js/quiz/quizCore.js
import { quizView } from '../../components/quizView.js';
import { quizState } from './quizState.js';
import { quizTimer } from './quizTimer.js';
import { supabase } from '../services/supabase.js';

export const quizCore = {
  container: null,
  slug: null,
  categoryPath: null, // Bagian URL (misal: 'bahasa')

  init(questions, container) {
    // 1. Ambil info dari URL aktif
    const hash = window.location.hash; 
    const parts = hash.split('/'); 
    
    this.categoryPath = parts[1]; // 'bahasa' atau 'sains' dari URL
    this.slug = parts[2];         // 'bhsindo1' dari URL
    
    this.container = container;
    this.start();
  },

  start() {
    this.container.innerHTML = quizView.mainFrame();
    this.renderQuestion();
  },

  renderQuestion() {
    const q = quizState.getCurrentQuestion();
    if (!q) return;

    const activeArea = document.getElementById('activeQuestionContainer');
    const timerDisplay = document.getElementById('timerDisplay');
    
    // 1. Tampilkan Kartu Soal
    activeArea.innerHTML = quizView.questionCard(
      q, 
      quizState.currentStep, 
      quizState.totalQuestions
    );

    // 2. Jalankan Timer per Soal
    quizTimer.start(60, 
      (time) => { if (timerDisplay) timerDisplay.textContent = time; },
      () => { this.handleSelection(q, null, true); } // Timeout
    );

    this.updateProgressUI();
    
    // 3. Listener Radio Buttons
    const inputs = activeArea.querySelectorAll('input[name="quiz-opt"]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleSelection(q, e.target.value, false));
    });
  },

  async handleSelection(q, selectedValue, isTimeout) {
    quizTimer.stop();
    
    // Hitung durasi sejak soal ditampilkan
    const duration = Math.floor((Date.now() - quizState.startTime) / 1000);
    
    const inputs = document.querySelectorAll('input[name="quiz-opt"]');
    inputs.forEach(i => i.disabled = true);

    const isCorrect = selectedValue === q.correct_answer;
    if (isCorrect) quizState.addScore();

    // Sesuai rujukan: Tampilkan feedbackArea dan actionContainer
    const feedbackArea = document.getElementById('feedbackArea');
    const feedbackText = document.getElementById('feedbackText');
    const actionContainer = document.getElementById('actionContainer');
    const nextBtn = document.getElementById('nextBtn');

    if (feedbackArea && feedbackText) {
      feedbackArea.style.display = 'block';
      
      // Styling feedback sesuai kondisi
      if (isTimeout) {
        feedbackText.innerHTML = `<b style="color:#ef4444">❌ Waktu Habis!</b><br>Jawaban benar: ${q.correct_answer}`;
      } else {
        feedbackText.innerHTML = isCorrect 
          ? `<b style="color:#10b981">✅ Benar!</b><br>${q.explanation || ''}` 
          : `<b style="color:#ef4444">❌ Kurang Tepat.</b><br>Jawaban benar: ${q.correct_answer}<br><br>${q.explanation || ''}`;
      }
    }

    if (actionContainer) {
      actionContainer.style.display = 'block';
    }

    if (nextBtn) {
      nextBtn.onclick = () => this.handleNext();
    }

    // Simpan ke Supabase
    await this.saveAttempt({
      session_id: this.slug,
      question_id: String(q.question || quizState.currentStep),
      dimension: q.dimension || "Umum",
      category: this.category,
      user_answer: selectedValue || "TIMEOUT",
      correct_answer: q.correct_answer,
      is_correct: isCorrect,
      score: isCorrect ? 1 : 0,
      duration_seconds: duration
    });
  },

  async saveAttempt(payload) {
    try {
      const { error } = await supabase.from("study_attempts").insert([payload]);
      if (error) throw error;
      console.log("Statistik berhasil direkam.");
    } catch (e) {
      console.error("Gagal merekam statistik:", e.message);
    }
  },

  handleNext() {
    if (quizState.hasNext()) {
      quizState.currentStep++;
      // Penting: Reset startTime state agar durasi per soal akurat
      quizState.startTime = Date.now(); 
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.finish();
    }
  },

  updateProgressUI() {
    // Sesuai rujukan: progres dihitung dari index soal saat ini
    const progress = ((quizState.currentStep + 1) / quizState.totalQuestions) * 100;
    const bar = document.getElementById('quizBar');
    const scoreEl = document.getElementById('liveScore');
    
    if (bar) bar.style.width = `${progress}%`;
    if (scoreEl) scoreEl.textContent = quizState.correctCount;
  },

  
  async finish() {
    quizTimer.stop();
    const rate = quizState.getScoreRate();
    let nextChapter = null;

    try {
      // 2. Ambil slug dan kolom 'category' (yang berisi judul materi)
      const { data: materialsAll, error } = await supabase
        .from('materi')
        .select('slug, category') // 'category' di sini adalah judul (misal: 'Bahasa Indonesia 1')
        .order('order', { ascending: true });

      if (error) throw error;

      const currentIndex = materialsAll.findIndex(m => m.slug === this.slug);

      // 3. Jika ada materi selanjutnya
      if (currentIndex !== -1 && currentIndex + 1 < materialsAll.length) {
        const nextData = materialsAll[currentIndex + 1];
        
        nextChapter = {
          // Tetap gunakan categoryPath dari URL agar navigasi SPA tidak pecah
          url: `#materi/${this.categoryPath}/${nextData.slug}`,
          // Gunakan isi kolom 'category' sebagai label tombol karena itu adalah judulnya
          title: nextData.category 
        };
      }
    } catch (err) {
      console.error("Gagal memuat materi selanjutnya:", err);
    }

    this.container.innerHTML = quizView.finalResult(
      rate, 
      quizState.correctCount, 
      quizState.totalQuestions,
      nextChapter
    );
  }
};
