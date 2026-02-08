import { generateQuiz } from '../services/quizClient.js';
import { saveStudyAttempt } from '../services/quizService.js';
import { quizTemplates } from '../../components/quizUi.js';

/**
 * Inisialisasi Generator Kuis
 * @param {Object} dataMateri - Objek baris tunggal dari tabel 'materi'
 */
export function initQuizGenerator(dataMateri) {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    // 1. Ambil teks materi dari layar
    const contentText = document.getElementById('learningContent')?.textContent.trim();

    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return;
    }

    // 2. Transisi UI
    if (materiContainer) materiContainer.style.display = 'none';
    quizEl.removeAttribute('hidden');
    
    // 3. PASANG TEMPLATE UTAMA (Ganti kode HTML lama kamu dengan ini)
    quizEl.innerHTML = quizTemplates.mainFrame(); 
    
    // Ambil container soal yang baru saja dibuat oleh mainFrame()
    const container = document.getElementById('activeQuestionContainer');
    container.innerHTML = '<div class="quiz-placeholder"><p>Sedang meracik soal untukmu...</p></div>';

    try {
      // 4. Panggil API dengan data dari DB (dataMateri)
      const result = await generateQuiz({
        materi: contentText,
        category: dataMateri?.category || "Materi",
        slug: dataMateri?.slug || "default",
        order: 1
      });

      if (result && result.quiz) {
        // Lanjut ke fungsi render (Langkah berikutnya)
        renderStepByStepQuiz(result.quiz, container, dataMateri);
      }
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p style="color:red">Gagal: ${err.message}</p>`;
    }
  };
}

function renderStepByStepQuiz(quizData, container, slug, judulKategori) {
  let currentStep = 0;
  let correctCount = 0;
  let timerInterval;
  const questions = quizData.questions;
  const total = questions.length;

  // Render Frame Utama dari quizUi.js
  const initFrame = () => {
    container.innerHTML = quizTemplates.mainFrame();
    displayQuestion();
  };

  const displayQuestion = () => {
    const q = questions[currentStep];
    const target = document.getElementById('activeQuestionContainer');
    const progressBar = document.getElementById('quizBar');
    const timerDisplay = document.getElementById('timerDisplay');
    const liveScoreEl = document.getElementById('liveScore');
    
    let timeLeft = 60;
    let startTime = Date.now();
    
    // Update Progress Bar
    if (progressBar) progressBar.style.width = `${(currentStep / total) * 100}%`;
    
    // Render Kartu Soal dari quizUi.js
    target.innerHTML = quizTemplates.questionCard(q, currentStep, total);

    // Timer Logic
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerDisplay) timerDisplay.innerText = timeLeft;
      if (timeLeft <= 0) handleSelection(null, true);
    }, 1000);

    const handleSelection = async (selectedValue, isTimeout = false) => {
      clearInterval(timerInterval);
      
      const isCorrect = selectedValue === q.correct_answer;
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // 1. Update Live Skor di UI
      if (isCorrect) {
        correctCount++;
        if (liveScoreEl) liveScoreEl.textContent = correctCount;
      }

      // 2. Simpan ke Database (study_attempts)
      await saveStudyAttempt({
        session_id: slug,
        question_id: String(q.id || currentStep),
        category: judulKategori, // Menggunakan kategori asli dari materi
        dimension: q.dimension || "Umum",
        user_answer: selectedValue || (isTimeout ? "TIMEOUT" : "NO_ANSWER"),
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        duration_seconds: duration
      });

      // 3. Tampilkan Feedback (Elemen dari quizUi.js)
      const fbContainer = document.getElementById('feedbackContainer');
      const fbText = document.getElementById('feedbackText');
      const actionContainer = document.getElementById('actionContainer');
      const nextBtn = document.getElementById('nextBtn');

      if (fbContainer && fbText) {
        fbContainer.style.display = 'block';
        fbContainer.style.borderColor = isCorrect ? '#4ade80' : '#f87171';
        fbText.innerHTML = isCorrect 
          ? `<b style="color:#4ade80">✓ Benar!</b>` 
          : `<b style="color:#f87171">✘ Kurang Tepat.</b><br>Jawaban benar: <i>${q.correct_answer}</i>`;
      }

      if (actionContainer) {
        actionContainer.style.display = 'block';
        nextBtn.onclick = () => {
          currentStep++;
          if (currentStep < total) {
            displayQuestion();
          } else {
            showFinalResult();
          }
        };
      }
      
      // Disable pilihan agar tidak bisa klik ulang
      target.querySelectorAll('input').forEach(input => input.disabled = true);
    };

    // Listener Jawaban
    target.querySelectorAll('input[name="answer"]').forEach(input => {
      input.onclick = (e) => handleSelection(e.target.value);
    });
  };

  const showFinalResult = () => {
    const rate = Math.round((correctCount / total) * 100);
    // Render Hasil Akhir dari quizUi.js
    container.innerHTML = quizTemplates.finalResult(rate, correctCount, total);
  };
  
  initFrame();
}
