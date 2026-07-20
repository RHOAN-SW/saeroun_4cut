import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function removeExpiredPhotos() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('photos')
    .select('id, filename')
    .lt('expires_at', new Date().toISOString())
    .limit(100);

  if (!data?.length) return;
  await supabase.storage.from('booth-uploads').remove(data.map(item => item.filename));
  await supabase.from('photos').delete().in('id', data.map(item => item.id));
}
