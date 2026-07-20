import { NextResponse } from 'next/server';
import { getSupabase, removeExpiredPhotos } from '@/lib/supabase-server';

const MAX_FILE_SIZE = 15 * 1024 * 1024;

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
    const filename = `${id}.jpg`;
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 10 * 60 * 1000);
    const bytes = new Uint8Array(await photo.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('booth-uploads')
      .upload(filename, bytes, { contentType: 'image/jpeg', upsert: false });
    if (uploadError) throw uploadError;

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
    return NextResponse.json({ error: '사진 업로드에 실패했습니다.' }, { status: 500 });
  }
}
