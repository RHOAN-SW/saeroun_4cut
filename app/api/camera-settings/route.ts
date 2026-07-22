import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase-server';

const SETTINGS_ID = 'default';
const ALLOWED_TIMERS = new Set([4, 6, 8, 12]);
const ALLOWED_SHOTS = new Set([4, 6, 8]);

const DEFAULT_SETTINGS = {
  timer: 6,
  shots: 6,
  mirror: true,
  filter: false,
  showGuide: true,
};

function toClientSettings(row: Record<string, unknown>) {
  return {
    timer: row.timer,
    shots: row.shots,
    mirror: row.mirror,
    filter: row.filter,
    showGuide: row.show_guide,
  };
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('camera_settings')
      .select('timer, shots, mirror, filter, show_guide')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(data ? toClientSettings(data) : DEFAULT_SETTINGS, {
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
    if (
      !ALLOWED_TIMERS.has(body.timer)
      || !ALLOWED_SHOTS.has(body.shots)
      || typeof body.mirror !== 'boolean'
      || typeof body.filter !== 'boolean'
      || typeof body.showGuide !== 'boolean'
    ) {
      return NextResponse.json({ error: '잘못된 설정값입니다.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('camera_settings')
      .upsert({
        id: SETTINGS_ID,
        timer: body.timer,
        shots: body.shots,
        mirror: body.mirror,
        filter: body.filter,
        show_guide: body.showGuide,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select('timer, shots, mirror, filter, show_guide')
      .single();

    if (error) throw error;
    return NextResponse.json(toClientSettings(data), {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Camera settings save failed', error);
    return NextResponse.json({ error: '카메라 설정을 저장하지 못했습니다.' }, { status: 500 });
  }
}
