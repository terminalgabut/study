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
  let correctCount = 0;
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
    
    let timeLeft = 60;
    let startTime = Date.now();
    
    if(progressBar) progressBar.style.width = `${(currentStep / total) * 100}%`;
    target.innerHTML = quizTemplates.questionCard(q, currentStep, total);

    // Timer Logic
    timerInterval = setInterval(() => {
      timeLeft--;
      if(timerDisplay) timerDisplay.innerText = timeLeft;
      if (timeLeft <= 0) handleSelection(null, true);
    }, 1000);

    const handleSelection = async (selectedValue, isTimeout) => {
      clearInterval(timerInterval);
      const isCorrect = selectedValue === q.correct_answer;
      const duration = Math.floor((Date.now() - startTime) / 1000);

      // FOKUS: Simpan tanpa duplikasi logika pengecekan di Service
      await saveStudyAttempt({
        session_id: slug,
        question_id: String(q.id || currentStep),
        category: judulMateri,         // Judul asli dari DOM
        dimension: q.dimension || "Umum",
        user_answer: selectedValue || "TIMEOUT",
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        score: isCorrect ? 1 : 0,
        duration_seconds: duration
      });

      // Feedback & Next Button Logic (panggil dari template/UI)
      // ...
    };

    // Event listener untuk pilihan jawaban
    target.querySelectorAll('input[name="answer"]').forEach(input => {
      input.onclick = (e) => handleSelection(e.target.value, false);
    });
  };
  
  initFrame();
}
