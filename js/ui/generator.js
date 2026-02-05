import { generateQuiz } from '../services/quizClient.js';

export function initQuizGenerator() {
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');
  const materiContainer = document.getElementById('materiContainer');
  const titleEl = document.getElementById('learningTitle');

  if (!btnEl || !quizEl) return;

  btnEl.onclick = async () => {
    const contentEl = document.getElementById('learningContent');
    const contentText = contentEl ? contentEl.textContent.trim() : ""; [cite: 120]

    if (!contentText || contentText.length < 10) {
      alert("Materi belum dimuat sempurna.");
      return; [cite: 122, 123]
    }

    // 1. SEMBUNYIKAN MATERI & SLIDE KE ATAS
    materiContainer.style.display = 'none';
    quizEl.classList.remove('hidden');
    titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 2. LOADING STATE (Tailwind)
    const quizUI = document.getElementById('quiz-ui');
    quizUI.innerHTML = `
      <div class="flex flex-col items-center py-10">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600 font-semibold">AI sedang menyusun 10 soal untukmu...</p>
      </div>
    `;

    const hash = window.location.hash.replace(/^#\/?/, '');
    const [category, slug] = hash.split('/'); [cite: 125]

    try {
      const result = await generateQuiz({
        materi: contentText, [cite: 126]
        category: category || "Umum",
        slug: slug || "default"
      });

      if (result && result.quiz) {
        renderQuiz(result.quiz, quizUI); [cite: 127]
      }
    } catch (err) {
      materiContainer.style.display = 'block';
      quizUI.innerHTML = `<p class="text-red-500 font-bold p-4">Error: ${err.message}</p>`; [cite: 128]
    }
  };
}

function renderQuiz(data, container) {
  let html = `
    <h2 class="text-2xl font-bold mb-6 text-center border-b pb-4">${data.category}</h2>
    <div id="questions-list" class="space-y-8">
  `;

  data.questions.forEach((q, i) => {
    html += `
      <div class="quiz-card" data-correct="${q.correct_answer}">
        <p class="text-xl font-semibold mb-4">${i + 1}. ${q.question}</p>
        <ul class="flex flex-col gap-3">
          ${q.options.map(opt => `
            <li>
              <label class="option-label flex items-center p-4 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-blue-50 transition group">
                <input type="radio" name="q${i}" value="${opt}" class="hidden peer">
                <div class="w-5 h-5 border-2 border-gray-300 rounded-full mr-3 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition"></div>
                <span class="text-gray-700 peer-checked:text-blue-700 peer-checked:font-bold">${opt}</span>
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  });

  html += `
    <button id="submitKuis" class="mt-8 w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg transition">
      Cek Hasil Jawaban
    </button>
  </div>
  `;

  container.innerHTML = html;

  document.getElementById('submitKuis').addEventListener('click', () => {
    hitungSkor(data.questions);
  });
}

function hitungSkor(questions) {
  let score = 0;
  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    const allLabels = document.querySelectorAll(`input[name="q${i}"]`);
    
    allLabels.forEach(input => {
      const label = input.closest('label');
      label.style.pointerEvents = 'none'; // Kunci jawaban
      
      // Hijau jika jawaban benar
      if (input.value === q.correct_answer) {
        label.classList.add('bg-green-100', 'border-green-500', 'text-green-700');
      }
      // Merah jika pilihan salah
      if (selected && selected.value === input.value && input.value !== q.correct_answer) {
        label.classList.add('bg-red-100', 'border-red-500', 'text-red-700');
      }
    });

    if (selected && selected.value === q.correct_answer) score++;
  });

  const finalScore = Math.round((score / questions.length) * 100);
  document.getElementById('final-score').innerText = finalScore;
  document.getElementById('results-ui').classList.remove('hidden');
  document.getElementById('submitKuis').style.display = 'none';
  document.getElementById('results-ui').scrollIntoView({ behavior: 'smooth' });
  }
