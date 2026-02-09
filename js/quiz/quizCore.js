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

    // Mengikuti rujukan: pastikan data soal ada
    if (questions && questions.questions) {
      quizState.reset(questions.questions);
      // Simpan kategori dari data utama jika ada
      this.category = questions.category || this.category;
    } else {
      quizState.reset(questions);
    }

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
    
    // Reset dan Jalankan Timer per Soal (Konsep Rujukan)
    quizTimer.start(60, 
      (time) => { if (timerDisplay) timerDisplay.textContent = time; },
      () => { this.handleSelection(q, null, true); } // Timeout
    );

    activeArea.innerHTML = quizView.questionCard(
      q, 
      quizState.currentStep, 
      quizState.totalQuestions
    );

    this.updateProgressUI();
    
    // Setup listener untuk pilihan (Konsep Rujukan)
    const inputs = activeArea.querySelectorAll('input[name="quiz-opt"]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleSelection(q, e.target.value, false));
    });
  },

  async handleSelection(q, selectedValue, isTimeout) {
    quizTimer.stop();
    const startTime = quizState.startTime; // Waktu mulai kuis/soal
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    const inputs = document.querySelectorAll('input[name="quiz-opt"]');
    inputs.forEach(i => i.disabled = true);

    const isCorrect = selectedValue === q.correct_answer;
    if (isCorrect) quizState.addScore();

    // Tampilkan Feedback (Konsep Rujukan: explanation)
    const feedbackArea = document.getElementById('feedbackArea');
    const nextBtn = document.getElementById('nextBtn');

    if (feedbackArea) {
      feedbackArea.style.display = 'block';
      if (isTimeout) {
        feedbackArea.innerHTML = `<b style="color:#ef4444">❌ Waktu Habis!</b><br>Jawaban benar: ${q.correct_answer}`;
      } else {
        feedbackArea.innerHTML = isCorrect 
          ? `<b style="color:#10b981">✅ Benar!</b><br>${q.explanation || ''}` 
          : `<b style="color:#ef4444">❌ Kurang Tepat.</b><br>Jawaban benar: ${q.correct_answer}<br><br>${q.explanation || ''}`;
      }
    }

    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.onclick = () => this.handleNext();
    }

    // Rekam Attempt sesuai rujukan SQL
    await this.saveAttempt({
      session_id: this.slug,
      question_id: String(q.id || quizState.currentStep),
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
      console.log("Statistik latihan berhasil diperbarui.");
    } catch (e) {
      console.error("Gagal merekam statistik:", e.message);
    }
  },

  handleNext() {
    if (quizState.hasNext()) {
      quizState.currentStep++;
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      this.finish();
    }
  },

  updateProgressUI() {
    const progress = (quizState.currentStep / quizState.totalQuestions) * 100;
    const bar = document.getElementById('quizBar');
    const scoreEl = document.getElementById('liveScore');
    if (bar) bar.style.width = `${progress}%`;
    if (scoreEl) scoreEl.textContent = quizState.correctCount;
  },

  finish() {
    quizTimer.stop();
    const rate = quizState.getScoreRate();
    this.container.innerHTML = quizView.finalResult(
      rate, 
      quizState.correctCount, 
      quizState.totalQuestions
    );
  }
};
