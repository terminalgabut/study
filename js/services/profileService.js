// root/js/services/profileService.js

export async function getProfileHeader(userId) {
  const { data, error } = await supabase
    .rpc('profile_header_overview', {
      user_uuid: userId
    });

  if (error) {
    console.error(error);
    return null;
  }

  if (!data || !data.length) return null;

  return data[0].profile_header_overview;
}
