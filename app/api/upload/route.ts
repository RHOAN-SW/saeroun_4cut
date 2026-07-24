import { NextResponse } from 'next/server';
import { getSupabase, removeExpiredPhotos } from '@/lib/supabase-server';

const MAX_FILE_SIZE = 15 * 1024 * 1024;
const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;
const MAX_FILES_PER_MINUTE = 9999;

function makeFilenamePrefix(date: Date) {
  const koreaTime = new Date(date.getTime() + KOREA_TIME_OFFSET_MS);
  const year = koreaTime.getUTCFullYear();
  const month = String(koreaTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(koreaTime.getUTCDate()).padStart(2, '0');
  const hour = String(koreaTime.getUTCHours()).padStart(2, '0');
  const minute = String(koreaTime.getUTCMinutes()).padStart(2, '0');
  return `${year}_${month}${day}_${hour}${minute}`;
}

function isDuplicateStorageError(error: { message?: string; statusCode?: string | number }) {
  return String(error.statusCode) === '409'
    || /already exists|duplicate|resource exists/i.test(error.message || '');
}

async function uploadWithSequentialFilename(
  supabase: ReturnType<typeof getSupabase>,
  bytes: Uint8Array,
  createdAt: Date,
) {
  const prefix = makeFilenamePrefix(createdAt);

  for (let sequence = 1; sequence <= MAX_FILES_PER_MINUTE; sequence += 1) {
    const suffix = String(sequence).padStart(4, '0');
    const filename = `${prefix}_${suffix}.jpg`;
    const { error } = await supabase.storage
      .from('booth-uploads')
      .upload(filename, bytes, { contentType: 'image/jpeg', upsert: false });

    if (!error) return filename;
    if (!isDuplicateStorageError(error)) throw error;
  }

  throw new Error('같은 시간대에 저장할 수 있는 사진 수를 초과했습니다.');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get('photo');
    if (!(photo instanceof File)) return NextResponse.json({ error: '사진 파일이 없습니다.' }, { status: 400 });
    if (!photo.type.startsWith('image/') || photo.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '지원하지 않는 사진입니다.' }, { status: 400 });
    }

    await removeExpiredPhotos().catch(() => {});

    const supabase = getSupabase();
    const id = crypto.randomUUID();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const filename = await uploadWithSequentialFilename(supabase, bytes, createdAt);

    const { error: dbError } = await supabase.from('photos').insert([{
      id,
      filename,
      created_at: createdAt.toISOString(),
      expires_at: expiresAt.toISOString(),
    }]);

    if (dbError) {
      await supabase.storage.from('booth-uploads').remove([filename]);
      throw dbError;
    }

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      id,
      downloadUrl: `${origin}/download?id=${id}`,
      expiresAt: expiresAt.toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Photo upload failed', error);
    const message = error instanceof Error ? error.message : '';
    const hint = message.includes('환경 변수') ? '서버 설정을 확인해주세요.' : '잠시 후 다시 시도해주세요.';
    return NextResponse.json({ error: `사진 업로드에 실패했습니다. ${hint}` }, { status: 500 });
  }
}
