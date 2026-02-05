import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');
  const pageEl = document.querySelector('.konten-page');

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    const contentEl = document.getElementById('learningContent');
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // 1. UI STATE: Sembunyikan materi & tampilkan loading kuis
    if (materiContainer) materiContainer.style.display = 'none';
    pageEl.classList.add('show-quiz');
    quizEl.removeAttribute('hidden');
    
    // Scroll ke atas agar user fokus ke judul/mulai kuis
    document.getElementById('learningTitle').scrollIntoView({ behavior: 'smooth' });

    quizEl.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-placeholder">
          <p>Sedang menyusun soal untukmu...</p>
        </div>
      </div>
    `;

    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [category, slug] = hash.split('/');

      const result = await generateQuiz({
        materi: contentText,
        category: category || "Umum",
        slug: slug || "default",
        order: 1
      });

      if (result && result.quiz) {
        renderStepByStepQuiz(result.quiz, quizEl);
      }
    } catch (err) {
      console.error("Generator Error:", err);
      if (materiContainer) materiContainer.style.display = 'block';
      quizEl.innerHTML = `<p style="color:var(--accent); text-align:center;">Gagal: ${err.message}</p>`;
    }
  };
}

function renderStepByStepQuiz(data, container) {
  let currentStep = 0;
  const questions = data.questions;
  const total = questions.length;

  // Fungsi utama untuk merender frame kuis
  const initFrame = () => {
    container.innerHTML = `
      <div class="quiz-progress-container" style="margin-bottom: 20px;">
        <div class="quiz-progress-bar" id="quizBar" style="height:6px; background:var(--accent); width:0%; border-radius:10px; transition: width 0.3s ease;"></div>
      </div>
      <div id="activeQuestionContainer"></div>
    `;
    displayQuestion();
  };

  // Fungsi untuk menampilkan satu soal saja
  const displayQuestion = () => {
    const q = questions[currentStep];
    const target = document.getElementById('activeQuestionContainer');
    const progressBar = document.getElementById('quizBar');

    // Update Progress Bar
    const progressPercent = ((currentStep) / total) * 100;
    progressBar.style.width = `${progressPercent}%`;

    target.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-item active">
          <h3 style="color:var(--accent); margin-bottom:10px; text-align:left;">Soal ${currentStep + 1} dari ${total}</h3>
          <p class="quiz-question" style="font-size:18px; font-weight:bold; margin-bottom:20px;">${q.question}</p>
          <div class="quiz-options" style="display:flex; flex-direction:column; gap:12px;">
            ${q.options.map((opt, index) => `
              <label class="option-label" style="display:flex; align-items:center; padding:15px; background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:12px; cursor:pointer;">
                <input type="radio" name="answer" value="${opt}" style="margin-right:15px; accent-color:var(--accent);">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Pasang Event Listener: Otomatis pindah saat diklik
    const inputs = target.querySelectorAll('input[name="answer"]');
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        // Beri jeda 400ms agar user bisa melihat pilihannya sebelum pindah
        setTimeout(() => {
          handleNext();
        }, 400);
      });
    });
  };

  const handleNext = () => {
    currentStep++;
    if (currentStep < total) {
      displayQuestion();
    } else {
      showResult();
    }
  };

  const showResult = () => {
    document.getElementById('quizBar').style.width = "100%";
    container.innerHTML = `
      <div class="quiz-container" style="text-align:center; padding:40px;">
        <h2 style="color:var(--accent); margin-bottom:15px;">Latihan Selesai!</h2>
        <p style="margin-bottom:25px;">Kamu telah menyelesaikan semua soal untuk bab ini.</p>
        <button class="primary-btn" onclick="location.reload()">Selesai & Kembali</button>
      </div>
    `;
  };

  initFrame();
}
