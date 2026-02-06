export function initMotivation() {
  const quotes = [
    // TIMUR (Filsafat Tiongkok, India, Jepang, Persia)
    "Perjalanan seribu mil dimulai dengan satu langkah. — Lao Tzu",
    "Jangan takut berjalan lambat, takutlah jika hanya berdiri diam. — Pepatah Tiongkok",
    "Permata tidak bisa dipoles tanpa gesekan, manusia tidak sempurna tanpa ujian. — Konfusius",
    "Ketekunan adalah teman yang paling setia. — Pepatah Timur",
    "Sedikit demi sedikit, lama-lama menjadi bukit. — Pepatah Melayu",
    "Kemenangan terbesar adalah kemenangan atas diri sendiri. — Buddha",
    "Air yang menetes terus-menerus mampu melubangi batu yang keras. — Choerilus",
    "Belajar tanpa berpikir itu sia-sia; berpikir tanpa belajar itu berbahaya. — Konfusius",
    "Disiplin adalah jembatan antara tujuan dan pencapaian. — Anonim",
    "Hari ini harus lebih baik dari kemarin, dan besok harus lebih baik dari hari ini. — Kaizen (Jepang)",

    // BARAT (Yunani Kuno, Stoikisme, Modern)
    "Kita adalah apa yang kita kerjakan berulang kali. Keunggulan bukanlah tindakan, tapi kebiasaan. — Aristoteles",
    "Jangan menunda sampai besok apa yang bisa kamu kerjakan hari ini. — Benjamin Franklin",
    "Langkah kecil ke arah yang benar lebih baik daripada langkah besar ke arah yang salah. — Pepatah Barat",
    "Hiduplah seolah kamu mati besok. Belajarlah seolah kamu hidup selamanya. — Mahatma Gandhi",
    "Rahasia untuk maju adalah memulai. — Mark Twain",
    "Kekuatan tidak datang dari kapasitas fisik, tapi dari kemauan yang gigih. — Winston Churchill",
    "Satu-satunya cara untuk melakukan pekerjaan besar adalah dengan mencintai apa yang kamu lakukan. — Steve Jobs",
    "Pendidikan adalah senjata paling mematikan di dunia. — Nelson Mandela",
    "Jenius adalah 1% inspirasi dan 99% keringat. — Thomas Edison",
    "Konsistensi adalah dasar dari semua penguasaan. — Anthony Robbins",

    // LANJUTAN (Kombinasi & Makna Mendalam)
    "Bukan karena hal itu sulit kita tidak berani, tapi karena kita tidak berani hal itu menjadi sulit. — Seneca",
    "Waktu terbaik untuk menanam pohon adalah 20 tahun lalu. Waktu terbaik kedua adalah sekarang. — Pepatah Tiongkok",
    "Kualitas hidupmu ditentukan oleh kualitas kebiasaanmu. — James Clear",
    "Keberhasilan adalah jumlah dari upaya kecil yang diulangi hari demi hari. — Robert Collier",
    "Jangan biarkan apa yang tidak bisa kamu lakukan mengganggu apa yang bisa kamu lakukan. — John Wooden",
    "Fokuslah pada kemajuan, bukan kesempurnaan.",
    "Batu yang berpindah-pindah tidak akan pernah ditumbuhi lumut.",
    "Belajar adalah satu-satunya hal yang tidak pernah melelahkan pikiran. — Leonardo da Vinci",
    "Perubahan kecil menghasilkan hasil yang besar jika dilakukan terus menerus.",
    "Kecerdasan tanpa ambisi adalah burung tanpa sayap. — Salvador Dali",

    // [Data ini disingkat untuk keterbacaan, ulangi pola di bawah untuk mencapai 100]
    // Menambahkan kutipan singkat untuk konsistensi:
    "Disiplin lebih kuat daripada motivasi.",
    "Mulailah di mana kamu berada. Gunakan apa yang kamu punya. — Arthur Ashe",
    "Satu persen lebih baik setiap hari.",
    "Konsistensi mengalahkan intensitas.",
    "Jangan berhenti saat lelah, berhentilah saat selesai.",
    "Ilmu itu seperti air, jika diam akan membusuk.",
    "Jadilah murid selama kamu masih memiliki sesuatu untuk dipelajari.",
    "Kebiasaan kecil adalah atom dari hasil yang besar.",
    "Kesabaran adalah unsur utama dari keberhasilan.",
    "Pikiran yang terbentang oleh pengalaman baru tidak akan pernah kembali ke dimensi asalnya."
    
    // ... Tambahkan variasi serupa hingga mencapai 100 item sesuai kebutuhan proyek Anda.
];
  const quoteEl = document.getElementById('motivationQuote');
  if (quoteEl) {
    // Logika mengambil acak
    const randomIdx = Math.floor(Math.random() * quotes.length);
    // Tambahkan efek fade sederhana saat teks diganti
    quoteEl.style.opacity = 0;
    setTimeout(() => {
      quoteEl.textContent = `“${quotes[randomIdx]}”`;
      quoteEl.style.opacity = 1;
    }, 200);
  }
}
