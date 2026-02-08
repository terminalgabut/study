// root/components/quizView.js

export const quizView = {
  // Container utama kuis
  mainFrame: () => `
    <div class="quiz-container">
      <div class="quiz-header">
        <div class="timer">⏱️ <span id="timerDisplay">60</span>s</div>
        <div id="liveScore">Skor: 0</div>
      </div>
      <div class="progress-container">
        <div class="progress-bar" id="quizBar" style="width: 0%"></div>
      </div>
      <div id="activeQuestionContainer">
        </div>
    </div>
  `,

  // Template kartu soal per langkah (step-by-step)
  questionCard: (q, index, total) => `
    <div class="question-card fade-in">
      <div class="question-meta">Pertanyaan ${index + 1} dari ${total}</div>
      <h3 class="question-text">${q.question}</h3>
      <div class="options-grid">
        ${Object.entries(q.options).map(([key, val]) => `
          <label class="option-item">
            <input type="radio" name="quiz-opt" value="${key}">
            <span class="option-label">${key}. ${val}</span>
          </label>
        `).join('')}
      </div>
      <div id="feedbackArea" class="feedback-area"></div>
      <button id="nextBtn" class="primary-btn" style="margin-top:20px; width:100%" disabled>
        Lanjut
      </button>
    </div>
  `,

  // Template layar hasil akhir
  finalResult: (rate, correct, total) => `
    <div class="quiz-container" style="text-align:center; padding:40px;">
      <h2 style="color:var(--accent)">Latihan Selesai!</h2>
      <div style="font-size:48px; margin:20px 0; font-weight:bold;">${rate}%</div>
      <p>Anda menjawab <b>${correct}</b> benar dari <b>${total}</b> soal.</p>
      <button onclick="location.reload()" class="primary-btn" style="margin-top:20px">
        Kembali ke Materi
      </button>
    </div>
  `,

  // Loading state
  loading: () => `
    <div class="quiz-container">
      <div class="quiz-placeholder">
        <p>Memasuki mode latihan, mohon tunggu...</p>
      </div>
    </div>
  `
};
