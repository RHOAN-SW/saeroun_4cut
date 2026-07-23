import { createClient } from '@supabase/supabase-js';

const PHOTO_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;

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
  const cutoff = new Date(Date.now() - PHOTO_RETENTION_MS).toISOString();
  let removedCount = 0;

  while (true) {
    const { data, error: selectError } = await supabase
      .from('photos')
      .select('id, filename')
      .lt('created_at', cutoff)
      .limit(100);

    if (selectError) throw selectError;
    if (!data?.length) return removedCount;

    const filenames = data.map(item => item.filename);
    const ids = data.map(item => item.id);
    const { error: storageError } = await supabase.storage.from('booth-uploads').remove(filenames);
    if (storageError) throw storageError;

    const { error: deleteError } = await supabase.from('photos').delete().in('id', ids);
    if (deleteError) throw deleteError;

    removedCount += data.length;
    if (data.length < 100) return removedCount;
  }
}
