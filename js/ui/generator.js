import { generateQuiz } from '../services/quizClient.js';
import { saveStudyAttempt } from '../services/quizService.js';
import { quizTemplates } from '../../compenents/quizUi.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    // FOKUS: Ambil judul asli dari halaman
    const titleEl = document.getElementById('learningTitle');
    const judulMateri = titleEl ? titleEl.textContent.trim() : "Umum";
    
    const contentEl = document.getElementById('learningContent');
    const contentText = contentEl ? contentEl.textContent.trim() : "";

    if (!contentText || contentText.length < 10) return;

    if (materiContainer) materiContainer.style.display = 'none';
    quizEl.removeAttribute('hidden');
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const slug = urlParams.get('slug') || "default";

      const result = await generateQuiz({
        materi: contentText,
        category: judulMateri, // Kirim judul asli ke AI
        slug: slug,
        order: 1
      });

      if (result && result.quiz) {
        renderStepByStepQuiz(result.quiz, quizEl, slug, judulMateri);
      }
    } catch (err) {
      console.error(err);
    }
  };
}

function renderStepByStepQuiz(data, container, slug, judulMateri) {
  let currentStep = 0;
  let correctCount = 0; // Ini adalah counter skor kita
  let timerInterval;
  const questions = data.questions;
  const total = questions.length;

  const initFrame = () => {
    container.innerHTML = quizTemplates.mainFrame();
    displayQuestion();
  };

  const displayQuestion = () => {
    const q = questions[currentStep];
    const target = document.getElementById('activeQuestionContainer');
    const progressBar = document.getElementById('quizBar');
    const timerDisplay = document.getElementById('timerDisplay');
    const liveScoreEl = document.getElementById('liveScore'); // Ambil elemen skor dari mainFrame
    
    let timeLeft = 60;
    let startTime = Date.now();
    
    if (progressBar) progressBar.style.width = `${(currentStep / total) * 100}%`;
    target.innerHTML = quizTemplates.questionCard(q, currentStep, total);

    timerInterval = setInterval(() => {
      timeLeft--;
      if (timerDisplay) timerDisplay.innerText = timeLeft;
      if (timeLeft <= 0) handleSelection(null, true);
    }, 1000);

    const handleSelection = async (selectedValue, isTimeout) => {
      clearInterval(timerInterval);
      const isCorrect = selectedValue === q.correct_answer;

      // --- LOGIKA LIVE SKOR ---
      if (isCorrect) {
        correctCount++; // Tambah poin
        if (liveScoreEl) {
          liveScoreEl.textContent = correctCount; // Update angka di layar secara real-time
          liveScoreEl.style.color = "var(--accent)"; // Beri efek warna saat bertambah
          liveScoreEl.style.fontWeight = "bold";
        }
      }
      // -------------------------

      const duration = Math.floor((Date.now() - startTime) / 1000);

      // Simpan ke database
      await saveStudyAttempt({
        session_id: slug,
        question_id: String(q.id || currentStep),
        category: judulMateri,
        dimension: q.dimension || "Umum",
        user_answer: selectedValue || "TIMEOUT",
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        duration_seconds: duration
      });

      // Tampilkan Feedback & Tombol Next
      const feedbackContainer = document.getElementById('feedbackContainer');
      const feedbackText = document.getElementById('feedbackText');
      const actionContainer = document.getElementById('actionContainer');

      if (feedbackContainer && feedbackText) {
        feedbackContainer.style.display = 'block';
        feedbackText.innerHTML = isCorrect 
          ? `<span style="color:#4ade80">✔ Benar!</span>` 
          : `<span style="color:#f87171">✘ Salah.</span> Jawaban: ${q.correct_answer}`;
      }

      if (actionContainer) {
        actionContainer.style.display = 'block';
        document.getElementById('nextBtn').onclick = () => {
          currentStep++;
          if (currentStep < total) {
            displayQuestion();
          } else {
            showFinalResult();
          }
        };
      }
    };

    target.querySelectorAll('input[name="answer"]').forEach(input => {
      input.onclick = (e) => handleSelection(e.target.value, false);
    });
  };

  const showFinalResult = () => {
    const rate = Math.round((correctCount / total) * 100);
    container.innerHTML = quizTemplates.finalResult(rate, correctCount, total);
  };
  
  initFrame();
}
