import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSupabaseEnv } from '@/lib/supabase/env';

export async function GET() {
  const { configured } = getSupabaseEnv();
  if (!configured) {
    return NextResponse.json({ configured: false, connected: false }, { status: 503 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.getSession();

    return NextResponse.json({
      configured: true,
      connected: !error,
    }, { status: error ? 502 : 200 });
  } catch {
    return NextResponse.json({ configured: true, connected: false }, { status: 502 });
  }
}
