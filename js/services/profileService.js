// js/services/profileService.js
import { supabase } from './supabase.js';

/**
 * Ambil profil berdasarkan userId
 */
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // lebih aman dari single()

  if (error) {
    console.error('getProfile error:', error);
    return null;
  }

  return data;
}

/**
 * Update sebagian field profil
 */
export async function updateProfile(userId, payload) {
  const { data, error } = await supabase
    .from('profile')
    .update(payload)
    .eq('id', userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error('updateProfile error:', error);
    throw error;
  }

  return data;
}

/**
 * Upsert (insert jika belum ada, update jika sudah ada)
 */
export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from('profile')
    .upsert(profile)
    .select()
    .maybeSingle();

  if (error) {
    console.error('upsertProfile error:', error);
    throw error;
  }

  return data;
}
