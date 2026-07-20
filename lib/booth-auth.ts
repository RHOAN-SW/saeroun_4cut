export const BOOTH_COOKIE_NAME = 'jr_booth_session';

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get('cookie') ?? '';
  for (const entry of cookies.split(';')) {
    const [key, ...value] = entry.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return null;
}

export function getBoothCode() {
  const code = process.env.BOOTH_CODE?.trim().toLowerCase();
  if (!code || !/^[a-z0-9]{6}$/.test(code)) {
    throw new Error('BOOTH_CODE 환경 변수가 올바르지 않습니다.');
  }
  return code;
}

export async function createBoothSession() {
  return sha256(`jr-fourcut:${getBoothCode()}`);
}

export async function hasValidBoothSession(request: Request) {
  const current = readCookie(request, BOOTH_COOKIE_NAME);
  if (!current) return false;
  return current === await createBoothSession();
}
