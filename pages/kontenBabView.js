// kontenBabView.js
export const kontenBabView = `
<section class="konten-page bg-gray-50 min-h-screen">
  <div class="konten-wrapper max-w-2xl mx-auto px-4 py-10">

    <div class="konten-header mb-8 text-center flex justify-between items-center">
      <h1 id="learningTitle" class="text-3xl font-bold text-gray-800"></h1>
      <button id="bookmarkBtn" class="text-gray-400 hover:text-blue-600 transition">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
    </div>

    <div id="materiContainer">
      <article id="learningContent" class="bg-white p-6 rounded-xl shadow-sm mb-6 prose max-w-none text-gray-700 leading-relaxed"></article>
      
      <div class="konten-actions flex justify-center mb-10">
        <button id="generateQuizBtn" class="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg transform active:scale-95">
          🎯 Mulai Latihan Soal
        </button>
      </div>
    </div>

    <section id="quizSection" class="hidden space-y-8">
      <div id="quiz-ui" class="bg-white rounded-xl shadow-xl p-6 sm:p-8">
         </div>
      
      <div id="results-ui" class="bg-white rounded-xl shadow-xl p-8 text-center hidden">
        <h2 class="text-3xl font-bold text-blue-600 mb-4">Hasil Kuis</h2>
        <p class="text-lg text-gray-600 mb-2">Skor Akhir Anda:</p>
        <p id="final-score" class="font-bold text-7xl text-green-600 my-4">0</p>
        <button onclick="location.reload()" class="mt-6 bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition">
          Kembali Baca Materi
        </button>
      </div>
    </section>

  </div>
</section>
`;
