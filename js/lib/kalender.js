// study/js/lib/kalender.js

// 1. Tangkap elemen yang kita buat di performaView
const trigger = document.getElementById('calendar-trigger');
const dateText = document.getElementById('selected-date-range');

// 2. Inisialisasi mesin kalender (Flatpickr)
// Kita set mode: "range" agar user bisa pilih durasi belajar
const fp = flatpickr(trigger, {
    mode: "range",
    dateFormat: "Y-m-d",
    onClose: function(selectedDates) {
        if (selectedDates.length === 2) {
            // A. Update tampilan tombol
            const rangeStr = formatRange(selectedDates[0], selectedDates[1]);
            dateText.innerText = rangeStr;

            // B. Jalankan Filter Data Supabase
            // Kita kirim tanggal ini ke fungsi updatePerforma(start, end)
            updateDashboardData(selectedDates[0], selectedDates[1]);
        }
    }
});
