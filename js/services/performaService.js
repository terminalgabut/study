import { supabase } from './supabase.js'; 

export const performaService = {
  async getDashboardData() {
    const [profileRes, attemptsRes, historyRes, achievementRes] = await Promise.all([
      supabase.from('profiles').select('*').single(),
      supabase.from('study_attempts').select('*').order('submitted_at', { ascending: true }),
      supabase.from('riwayat').select('*, materi(title, category)'),
      supabase.from('user_achievements').select('*, achievements(*)') 
    ]);

    if (profileRes.error) console.warn("Profile belum diset");

    const attempts = attemptsRes.data || [];
    const history = historyRes.data || [];

    return {
      profile: profileRes.data,
      attempts: attempts,
      history: history,
      achievements: achievementRes.data || [],
      stats: this.calculateStats(attempts, history)
    };
  },

  calculateStats(attempts, history) {
    // 1. Total Materi & Waktu (Sudah ada)
    const totalMateri = history.length;
    const totalSeconds = history.reduce((acc, curr) => acc + (curr.duration_seconds || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const timeString = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

    // 2. Rata-rata Skor (Sudah ada)
    const totalScore = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    const avgScore = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;

    // 3. Peta Kekuatan (Real Data dari Kategori)
    // Mengelompokkan attempts berdasarkan kategori materi
    const categoryMap = {};
    attempts.forEach(att => {
      const cat = att.materi?.category || 'Umum';
      if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
      categoryMap[cat].total += att.score;
      categoryMap[cat].count += 1;
    });

    const categoryData = {
      labels: Object.keys(categoryMap),
      scores: Object.values(categoryMap).map(c => Math.round(c.total / c.count))
    };

    // 4. Hitung Streak (Real Data)
    let streak = 0;
    if (attempts.length > 0) {
      // Ambil tanggal unik (YYYY-MM-DD) dari attempts, urutkan terbaru ke lama
      const dates = [...new Set(attempts.map(a => a.submitted_at.split('T')[0]))]
                    .sort((a, b) => new Date(b) - new Date(a));
      
      let checkDate = new Date(); // Mulai dari hari ini
      
      for (let i = 0; i < dates.length; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dates.includes(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1); // Mundur 1 hari
        } else {
          // Jika hari ini belum ada data, cek apakah kemarin ada (agar streak tidak langsung 0 pagi-pagi)
          if (i === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            const yesterdayStr = checkDate.toISOString().split('T')[0];
            if (dates.includes(yesterdayStr)) {
                // Lanjut cek mulai dari kemarin
                continue; 
            }
          }
          break;
        }
      }
    }

    return { 
      totalMateri, 
      timeString, 
      avgScore, 
      streak, 
      categoryData // Data baru untuk grafik bar
    };
  }
};
