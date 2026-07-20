import { NextResponse } from 'next/server';
import { BOOTH_COOKIE_NAME, createBoothSession, getBoothCode, hasValidBoothSession } from '@/lib/booth-auth';

export async function GET(request: Request) {
  return NextResponse.json(
    { authenticated: await hasValidBoothSession(request) },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { code?: unknown };
    const code = typeof body.code === 'string' ? body.code.trim().toLowerCase() : '';

    if (!/^[a-z0-9]{6}$/.test(code) || code !== getBoothCode()) {
      await new Promise(resolve => setTimeout(resolve, 350));
      return NextResponse.json({ error: '코드를 다시 확인해주세요.' }, { status: 401 });
    }

    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(BOOTH_COOKIE_NAME, await createBoothSession(), {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json({ error: '로그인할 수 없습니다.' }, { status: 400 });
  }
}
