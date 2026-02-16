// js/services/profileService.js
import { supabase } from "./supabase.js";

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function upsertProfile(profile) {
  const { data, error } = await supabase
    .from("profile")
    .upsert(profile)
    .select()
    .single();

  if (error) throw error;
  return data;
}
