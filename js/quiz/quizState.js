// root/js/quiz/quizState.js

export const quizState = {
  currentStep: 0,
  correctCount: 0,
  totalQuestions: 0,
  questions: [],
  startTime: null,
  sessionId: null,

  // Reset data setiap kali kuis baru dimulai
  reset(questions) {
    this.currentStep = 0;
    this.correctCount = 0;
    this.questions = questions;
    this.totalQuestions = questions.length;
    this.startTime = Date.now();
    this.sessionId = Math.random().toString(36).substring(2, 15);
  },

  // Tambah skor jika jawaban benar
  addScore() {
    this.correctCount++;
  },

  // Hitung persentase nilai akhir
  getScoreRate() {
    return Math.round((this.correctCount / this.totalQuestions) * 100);
  },

  // Cek apakah masih ada soal berikutnya
  hasNext() {
    return this.currentStep < this.totalQuestions - 1;
  }
};
