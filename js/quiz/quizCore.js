// root/js/quiz/quizCore.js
import { quizView } from '../../components/quizView.js';
import { quizState } from './quizState.js';
import { quizTimer } from './quizTimer.js';
import { supabase } from '../services/supabase.js';

export const quizCore = {
  container: null,
  category: null,
  slug: null,

  init(questions, container, category) {
    const urlParams = new URLSearchParams(window.location.search);
    this.slug = urlParams.get('slug') || "default";
    this.container = container;
    this.category = category || "Umum";

    // Proteksi data soal
    const data = questions?.questions || questions;
    quizState.reset(Array.isArray(data) ? data : []);
    
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

  // root/js/quiz/quizCore.js (Bagian finish)

finish() {
  quizTimer.stop();
  const rate = quizState.getScoreRate();
  
  // Cari link bab berikutnya di sidebar/navigasi
  // Menyesuaikan dengan kebiasaan struktur sidebar link
  const allLinks = Array.from(document.querySelectorAll('.sidebar-link, .nav-link'));
  const currentIndex = allLinks.findIndex(link => link.href.includes(this.slug));
  
  let nextChapter = null;
  if (currentIndex !== -1 && allLinks[currentIndex + 1]) {
    const nextEl = allLinks[currentIndex + 1];
    nextChapter = {
      url: nextEl.href,
      title: nextEl.textContent.trim()
    };
  }

  this.container.innerHTML = quizView.finalResult(
    rate, 
    quizState.correctCount, 
    quizState.totalQuestions,
    nextChapter
  )
};
