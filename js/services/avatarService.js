// js/services/avatarService.js

import { supabase } from './supabase.js';

const BUCKET_NAME = 'avatars';
const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function validateFile(file) {
  if (!file) throw new Error('File tidak ditemukan');

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Format file tidak didukung');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('Ukuran file maksimal 2MB');
  }
}

export async function uploadAvatar(userId, file) {
  validateFile(file);

  const ext = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${ext}`;

  // upload (overwrite)
  const { error: uploadError } = await supabase
    .storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type
    });

  if (uploadError) throw uploadError;

  const { data } = supabase
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  const avatarUrl = data.publicUrl;

  // simpan ke tabel profile
  const { error: updateError } = await supabase
    .from('profile')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (updateError) throw updateError;

  return avatarUrl;
}

export async function deleteAvatar(userId) {
  const filePath = `${userId}`;

  await supabase
    .storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  const { error } = await supabase
    .from('profile')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}
