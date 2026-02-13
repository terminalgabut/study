// study/js/lib/kalender.js

export const initCalendar = (onDateChange) => {
  const trigger = document.getElementById('calendar-trigger');
  const dateText = document.getElementById('selected-date-range');

  // 1. Inisialisasi Flatpickr
  const fp = flatpickr(trigger, {
    mode: "range",
    dateFormat: "Y-m-d",
    maxDate: "today", // User tidak bisa pilih masa depan
    prevArrow: '<i class="fas fa-chevron-left"></i>',
    nextArrow: '<i class="fas fa-chevron-right"></i>',
    
    // Saat kalender ditutup setelah memilih range
    onClose: function(selectedDates) {
      if (selectedDates.length === 2) {
        const start = selectedDates[0];
        const end = selectedDates[1];

        // 2. Update Tampilan Tombol (Format: 01 Feb - 07 Feb)
        const options = { day: '2-digit', month: 'short' };
        const rangeStr = `${start.toLocaleDateString('id-ID', options)} - ${end.toLocaleDateString('id-ID', options)}`;
        dateText.innerText = rangeStr;

        // 3. Panggil Callback untuk Filter Data Supabase & Grafik
        if (onDateChange) {
          onDateChange(start, end);
        }
      }
    },
    
    // Pasang saat pertama kali load (Default: 7 hari terakhir)
    onReady: function(selectedDates, dateStr, instance) {
       // Opsional: Set default range di sini
    }
  });

  return fp;
};
