// js/services/journalService.js
import { supabase } from './supabase.js';

export const journalService = {
  async getWeeklySnapshots(userId) {
    if (!userId) return [];

    const { data, error } = await supabase
      .from('weekly_journal_snapshot')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};
