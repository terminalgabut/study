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
   * @param {Array} questions - Daftar soal dari AI
   * @param {HTMLElement} container - Element quizSection
   * @param {String} category - Judul Bab dari learningTitle
   */
  init(questions, container, category) {
    this.container = container;
    this.category = category || "Umum";
    quizState.reset(questions);
    this.start();
  },

  start() {
    // 1. Tampilkan Frame Utama (Timer & Score bar)
    this.container.innerHTML = quizView.mainFrame();
    
    // 2. Jalankan Timer (60 detik)
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
    const q = quizState.questions[quizState.currentStep];
    const activeArea = document.getElementById('activeQuestionContainer');
    
    if (!activeArea) return;

    // Tampilkan Kartu Soal
    activeArea.innerHTML = quizView.questionCard(
      q, 
      quizState.currentStep, 
      quizState.totalQuestions
    );

    // Update Progress UI
    this.updateProgressUI();

    // Pasang Event Listener ke pilihan jawaban
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
        // Kunci pilihan lain setelah memilih
        options.forEach(o => o.disabled = true);
        
        const isCorrect = opt.value === q.answer;
        if (isCorrect) quizState.addScore();

        // Tampilkan Feedback visual
        feedbackEl.innerHTML = isCorrect ? 
          '<p style="color:#2ecc71; font-weight:bold; margin-top:10px;">✅ Benar!</p>' : 
          `<p style="color:#e74c3c; font-weight:bold; margin-top:10px;">❌ Salah. Jawaban: ${q.answer}</p>`;

        // Aktifkan tombol lanjut
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
      const duration = Math.floor((Date.now() - quizState.startTime) / 1000);
      
      const payload = {
        question_id: q.question, // Menggunakan teks soal sebagai ID
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        session_id: quizState.sessionId,
        user_answer: userAns,
        correct_answer: q.answer,
        duration_seconds: duration,
        category: this.category, // Judul Bab
        dimension: q.dimension,
        submitted_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("study_attempts")
        .insert([payload]);

      if (error) throw error;
      console.log("Data berhasil masuk ke study_attempts");
      
    } catch (e) {
      console.error("Database Error:", e.message);
    }
  },

  finish() {
    quizTimer.stop();
    const rate = quizState.getScoreRate();
    
    // Tampilkan layar hasil akhir
    this.container.innerHTML = quizView.finalResult(
      rate, 
      quizState.correctCount, 
      quizState.totalQuestions
    );
  }
};
