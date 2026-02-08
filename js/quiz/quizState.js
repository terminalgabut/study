// root/js/quiz/quizState.js

export const quizState = {
  currentStep: 0,
  correctCount: 0,
  totalQuestions: 0,
  questions: [],
  startTime: null,
  sessionId: null,

  /**
   * Reset data setiap kali kuis baru dimulai
   * @param {Array} questionsData - Array soal dari generator
   */
  reset(questionsData) {
    // 1. Validasi: Pastikan data yang masuk adalah array
    // Jika API mengembalikan { quiz: [...] }, kita ambil bagian dalamnya
    const validatedQuestions = Array.isArray(questionsData) 
      ? questionsData 
      : (questionsData?.quiz || []);

    this.questions = validatedQuestions;
    this.totalQuestions = validatedQuestions.length;
    
    // 2. Reset progress
    this.currentStep = 0;
    this.correctCount = 0;
    
    // 3. Metadata kuis
    this.startTime = Date.now();
    this.sessionId = `session_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

    // Debugging (opsional, bisa dihapus jika sudah jalan)
    console.log("Quiz State Ready. Total Soal:", this.totalQuestions);
    if (this.totalQuestions === 0) {
        console.error("Warning: QuizState diinisialisasi dengan 0 soal!");
    }
  },

  // Tambah skor jika jawaban benar
  addScore() {
    this.correctCount++;
  },

  // Ambil soal saat ini secara aman
  getCurrentQuestion() {
    return this.questions[this.currentStep] || null;
  },

  // Hitung persentase nilai akhir
  getScoreRate() {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.correctCount / this.totalQuestions) * 100);
  },

  // Cek apakah masih ada soal berikutnya
  hasNext() {
    return this.currentStep < this.totalQuestions - 1;
  }
};
