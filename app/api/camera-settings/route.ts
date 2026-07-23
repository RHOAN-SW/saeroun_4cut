import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase-server';

const SETTINGS_ID = 'default';
const SETTINGS_BUCKET = 'booth-uploads';
const SETTINGS_FILE = `app-data/camera-settings/${SETTINGS_ID}.json`;
const ALLOWED_TIMERS = new Set([4, 6, 8, 12]);
const ALLOWED_SHOTS = new Set([4, 6, 8]);

const DEFAULT_SETTINGS = {
  timer: 8,
  shots: 6,
  mirror: true,
  filter: false,
  showGuide: true,
};

function isValidSettings(value: unknown): value is typeof DEFAULT_SETTINGS {
  if (!value || typeof value !== 'object') return false;
  const settings = value as Record<string, unknown>;

  return (
    typeof settings.timer === 'number'
    && ALLOWED_TIMERS.has(settings.timer)
    && typeof settings.shots === 'number'
    && ALLOWED_SHOTS.has(settings.shots)
    && typeof settings.mirror === 'boolean'
    && typeof settings.filter === 'boolean'
    && typeof settings.showGuide === 'boolean'
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.storage
      .from(SETTINGS_BUCKET)
      .download(SETTINGS_FILE);

    if (error) {
      if (/not found|does not exist/i.test(error.message)) {
        return NextResponse.json(DEFAULT_SETTINGS, {
          headers: { 'Cache-Control': 'no-store' },
        });
      }
      throw error;
    }

    const savedSettings = JSON.parse(await data.text());
    if (!isValidSettings(savedSettings)) throw new Error('저장된 카메라 설정값이 올바르지 않습니다.');

    return NextResponse.json(savedSettings, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Camera settings load failed', error);
    return NextResponse.json({ error: '카메라 설정을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const suppliedPin = request.headers.get('x-settings-pin');
    const settingsPin = process.env.CAMERA_SETTINGS_PIN || '1111';
    if (suppliedPin !== settingsPin) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 401 });
    }

    const body = await request.json();
    if (!isValidSettings(body)) {
      return NextResponse.json({ error: '잘못된 설정값입니다.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(SETTINGS_BUCKET)
      .upload(SETTINGS_FILE, JSON.stringify(body), {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) throw error;
    return NextResponse.json(body, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Camera settings save failed', error);
    return NextResponse.json({ error: '카메라 설정을 저장하지 못했습니다.' }, { status: 500 });
  }
}
