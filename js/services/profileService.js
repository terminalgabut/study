// root/js/services/profileService.js

import { supabase } from './supabase.js'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profile')
    .select('id, full_name, username, avatar_url, xp')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error(error)
    return null
  }

  return data
}

export async function getProfileHeader(userId) {
  const { data, error } = await supabase
    .rpc('profile_header_overview', {
      user_uuid: userId
    })

  if (error) {
    console.error(error)
    return null
  }

  return data
}
