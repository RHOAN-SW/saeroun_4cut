import { NextResponse } from 'next/server';
import { removeExpiredPhotos } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const isAuthorized = cronSecret
    ? request.headers.get('authorization') === `Bearer ${cronSecret}`
    : request.headers.get('user-agent') === 'vercel-cron/1.0';

  if (!isAuthorized) {
    return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
  }

  try {
    const removed = await removeExpiredPhotos();
    return NextResponse.json(
      { ok: true, removed },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('Expired photo cleanup failed', error);
    return NextResponse.json({ error: '사진 정리에 실패했습니다.' }, { status: 500 });
  }
}
