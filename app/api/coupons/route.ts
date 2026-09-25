import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in to use coupons.' }, { status: 401 });
  let body: { code?:string; subtotal?:number };
  try { body = await request.json(); } catch { return NextResponse.json({ error:'Invalid request.' }, { status:400 }); }
  const code = String(body.code || '').trim().slice(0, 40);
  const subtotal = Number(body.subtotal);
  if (!code || !Number.isFinite(subtotal) || subtotal <= 0) return NextResponse.json({ error:'Enter a valid coupon code.' }, { status:400 });
  const { data, error } = await supabase.rpc('preview_coupon', { p_code:code, p_user_id:user.id, p_subtotal:subtotal });
  if (error || !data?.[0]) return NextResponse.json({ error: error?.message?.replace(/^.*?\[?P0001\]?\s*/,'') || 'This coupon cannot be applied.' }, { status:400 });
  return NextResponse.json({ coupon:data[0] });
}
