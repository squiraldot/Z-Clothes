import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type AddressBody = {
  fullName?: string; phone?: string; line1?: string; line2?: string;
  landmark?: string; city?: string; state?: string; pincode?: string; isDefault?: boolean;
};

function clean(value: unknown, max: number) { return String(value ?? '').trim().slice(0, max); }
function validate(body: AddressBody) {
  const fullName = clean(body.fullName, 80), phone = clean(body.phone, 20), line1 = clean(body.line1, 160);
  const line2 = clean(body.line2, 160), landmark = clean(body.landmark, 120), city = clean(body.city, 80);
  const state = clean(body.state, 80), pincode = clean(body.pincode, 10);
  if (!fullName || !phone || !line1 || !city || !state || !/^[0-9]{6}$/.test(pincode)) return null;
  if (!/^[0-9+()\-\s]{10,20}$/.test(phone)) return null;
  return { full_name: fullName, phone, line1, line2: line2 || null, landmark: landmark || null, city, state, pincode, is_default: Boolean(body.isDefault) };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  let body: AddressBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const address = validate(body);
  if (!address) return NextResponse.json({ error: 'Please enter valid address details.' }, { status: 400 });
  if (address.is_default) await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  const { data, error } = await supabase.from('addresses').update(address).eq('id', id).eq('user_id', user.id).select('*').maybeSingle();
  if (error) return NextResponse.json({ error: 'Unable to update your address.' }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
  return NextResponse.json({ address: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data: address } = await supabase.from('addresses').select('id,is_default').eq('id', id).eq('user_id', user.id).maybeSingle();
  if (!address) return NextResponse.json({ error: 'Address not found.' }, { status: 404 });
  const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: 'Unable to delete your address.' }, { status: 500 });
  if (address.is_default) {
    const { data: next } = await supabase.from('addresses').select('id').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (next) await supabase.from('addresses').update({ is_default: true }).eq('id', next.id).eq('user_id', user.id);
  }
  return NextResponse.json({ ok: true });
}
