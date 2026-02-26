export async function getProfileHeader(userId) {
  const { data, error } = await supabase
    .rpc('profile_header_overview', {
      user_uuid: userId
    });

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}
