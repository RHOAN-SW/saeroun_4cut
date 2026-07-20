import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase-server';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: '잘못된 주소입니다.' }, { status: 400 });

  const supabase = getSupabase();
  const { data: photo, error } = await supabase.from('photos').select('filename, expires_at').eq('id', id).single();
  if (error || !photo) return NextResponse.json({ error: '사진을 찾을 수 없습니다.' }, { status: 404 });
  if (Date.now() >= new Date(photo.expires_at).getTime()) {
    return NextResponse.json({ error: '다운로드 시간이 만료되었습니다.' }, { status: 410 });
  }

  const { data: blob, error: downloadError } = await supabase.storage.from('booth-uploads').download(photo.filename);
  if (downloadError || !blob) return NextResponse.json({ error: '사진을 불러오지 못했습니다.' }, { status: 404 });

  const inline = new URL(request.url).searchParams.get('inline') === '1';
  return new Response(blob, {
    headers: {
      'Content-Type': blob.type || 'image/jpeg',
      'Content-Disposition': `${inline ? 'inline' : 'attachment'}; filename="jr-fourcut-${id}.jpg"`,
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}
