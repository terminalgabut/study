export function initQuizGenerator() {
  const pageEl = document.querySelector('.konten-page');
  const btnEl = document.getElementById('generateQuizBtn');
  const quizEl = document.getElementById('quizSection');

  if (!pageEl || !btnEl || !quizEl) return;

  btnEl.addEventListener('click', () => {
    // toggle state
    pageEl.classList.add('show-quiz');

    // pastikan quiz terlihat (jaga-jaga)
    quizEl.removeAttribute('hidden');

    // scroll halus ke quiz
    quizEl.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });
}
