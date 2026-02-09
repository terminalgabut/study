// root/components/quizView.js

export const quizView = {
  // Placeholder saat memuat kuis (sesuai rujukan)
  loading() {
    return `
      <div class="quiz-container">
        <div class="quiz-placeholder">
          <p>Memasuki mode latihan, mohon tunggu...</p>
        </div>
      </div>
    `;
  },

  // Bingkai utama kuis (Progress bar & Timer)
  mainFrame() {
    return `
      <div class="quiz-container">
        <div class="quiz-header">
          <div class="quiz-progress-wrapper">
            <div id="quizBar" class="quiz-progress-bar" style="width: 0%"></div>
          </div>
          <div class="quiz-meta">
            <span class="quiz-timer">⏱️ <span id="timerDisplay">60</span>s</span>
            <span class="quiz-score-live">Skor: <b id="liveScore">0</b></span>
          </div>
        </div>
        <div id="activeQuestionContainer"></div>
      </div>
    `;
  },

  // Kartu Soal (Sesuai gaya rujukan)
  questionCard(q, currentStep, total) {
    const options = q.options || [];
    return `
      <div class="quiz-card animate-fade-in">
        <div class="quiz-question-header">
          <span class="quiz-badge">Pertanyaan ${currentStep + 1} / ${total}</span>
        </div>
        
        <h3 class="quiz-question-text">${q.question}</h3>
        
        <div class="quiz-options-grid">
          ${options.map((opt, index) => `
            <label class="quiz-opt-label">
              <input type="radio" name="quiz-opt" value="${opt}" class="quiz-opt-input">
              <span class="quiz-opt-custom">
                <span class="opt-letter">${String.fromCharCode(65 + index)}</span>
                <span class="opt-text">${opt}</span>
              </span>
            </label>
          `).join('')}
        </div>

        <div id="feedbackArea" class="quiz-feedback" style="display: none;"></div>
        
        <div class="quiz-actions">
          <button id="nextBtn" class="btn-next" disabled>
            ${currentStep + 1 === total ? 'Lihat Hasil' : 'Lanjut'} 
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    `;
  },

  // Hasil Akhir (Sesuai rujukan: warna accent, rate, dan tombol reset)
  finalResult(rate, correctCount, total) {
    return `
      <div class="quiz-container" style="text-align:center; padding:40px;">
        <h2 style="color:var(--accent)">Latihan Selesai!</h2>
        <div style="font-size:48px; margin:20px 0; font-weight:bold; color:var(--text-primary)">${rate}%</div>
        <p style="margin-bottom: 25px;">Anda menjawab <b>${correctCount}</b> benar dari <b>${total}</b> soal.</p>
        
        <div class="result-actions">
          <button onclick="location.reload()" class="btn-primary">
            <i class="fas fa-redo"></i> Ulangi Latihan
          </button>
        </div>
      </div>
    `;
  }
};
