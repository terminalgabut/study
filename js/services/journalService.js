// js/services/journalService.js
import { supabase } from './supabase.js'

export const journalService = {
  /**
   * Mengambil semua snapshot jurnal dari DB.
   * Data sudah dihitung otomatis oleh Database Trigger.
   */
  async getWeeklySnapshots(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('weekly_journal_snapshot')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false });

    if (error) {
      console.error('[JournalService] Gagal fetch:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * (Opsional) Jika ingin memaksa update jurnal saat user klik tombol "Refresh"
   * Kita cukup melakukan dummy update ke salah satu table agar trigger jalan.
   */
  async refreshJournal(userId) {
     // Logika trigger otomatis sudah menangani ini setiap ada aktivitas baru.
     return this.getWeeklySnapshots(userId);
  }
};
