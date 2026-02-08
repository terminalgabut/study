// root/js/quiz/quizCore.js
import { quizView } from '../../components/quizView.js';
import { quizState } from './quizState.js';
import { quizTimer } from './quizTimer.js';
import { supabase } from '../services/supabase.js';

export const quizCore = {
  container: null,
  category: null,

  /**
   * Inisialisasi Kuis
   */
  init(questions, container, category) {
    if (!questions || (Array.isArray(questions) && questions.length === 0)) {
      console.error("QuizCore: Tidak ada soal untuk dimuat.");
      return;
    }
    
    this.container = container;
    this.category = category || "Umum";
    
    // Pastikan data di-reset di state
    quizState.reset(questions);
    this.start();
  },

  start() {
    if (!this.container) return;

    // 1. Tampilkan Frame Utama
    this.container.innerHTML = quizView.mainFrame();
    
    // 2. Jalankan Timer
    quizTimer.start(60, 
      (time) => { 
        const timerEl = document.getElementById('timerDisplay');
        if (timerEl) timerEl.textContent = time; 
      },
      () => { this.finish(); }
    );

    this.renderQuestion();
  },

  renderQuestion() {
    // Gunakan fungsi getter dari state yang sudah diperbaiki
    const q = quizState.getCurrentQuestion ? quizState.getCurrentQuestion() : quizState.questions[quizState.currentStep];
    
    // VALIDASI KRUSIAL: Cegah error "reading property question of undefined"
    if (!q) {
      console.error("QuizCore: Soal tidak ditemukan pada index", quizState.currentStep);
      return;
    }

    const activeArea = document.getElementById('activeQuestionContainer');
    if (!activeArea) return;

    // Tampilkan Kartu Soal
    activeArea.innerHTML = quizView.questionCard(
      q, 
      quizState.currentStep, 
      quizState.totalQuestions
    );

    this.updateProgressUI();
    this.setupOptions(q);
  },

  updateProgressUI() {
    const progress = ((quizState.currentStep + 1) / quizState.totalQuestions) * 100;
    const bar = document.getElementById('quizBar');
    const scoreEl = document.getElementById('liveScore');

    if (bar) bar.style.width = `${progress}%`;
    if (scoreEl) scoreEl.textContent = `Skor: ${quizState.correctCount}`;
  },

  setupOptions(q) {
    const options = document.querySelectorAll('input[name="quiz-opt"]');
    const nextBtn = document.getElementById('nextBtn');
    const feedbackEl = document.getElementById('feedbackArea');

    options.forEach(opt => {
      opt.onchange = () => {
        // Kunci semua pilihan
        options.forEach(o => o.disabled = true);
        
        // Cek jawaban (AI biasanya mengirim 'answer' atau 'correct_answer')
        const correctAnswer = q.answer || q.correct_answer;
        const isCorrect = opt.value === correctAnswer;
        
        if (isCorrect) quizState.addScore();

        // Tampilkan Feedback
        if (feedbackEl) {
          feedbackEl.innerHTML = isCorrect ? 
            '<p style="color:#2ecc71; font-weight:bold; margin-top:10px;">✅ Benar!</p>' : 
            `<p style="color:#e74c3c; font-weight:bold; margin-top:10px;">❌ Salah. Jawaban: ${correctAnswer}</p>`;
        }

        if (nextBtn) nextBtn.disabled = false;

        // Simpan ke database
        this.saveStepToDb(q, opt.value, isCorrect);
      };
    });

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (quizState.hasNext()) {
          quizState.currentStep++;
          this.renderQuestion();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          this.finish();
        }
      };
    }
  },

  async saveStepToDb(q, userAns, isCorrect) {
    try {
      const duration = quizState.startTime ? Math.floor((Date.now() - quizState.startTime) / 1000) : 0;
      
      const payload = {
        question_id: q.question || "Unknown Question",
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        session_id: quizState.sessionId,
        user_answer: userAns,
        correct_answer: q.answer || q.correct_answer,
        duration_seconds: duration,
        category: this.category,
        dimension: q.dimension || "General",
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("study_attempts")
        .insert([payload]);

      if (error) throw error;
    } catch (e) {
      console.error("QuizCore DB Error:", e.message);
    }
  },

  finish() {
    quizTimer.stop();
    const rate = quizState.getScoreRate();
    
    if (this.container) {
      this.container.innerHTML = quizView.finalResult(
        rate, 
        quizState.correctCount, 
        quizState.totalQuestions
      );
    }
  }
};
