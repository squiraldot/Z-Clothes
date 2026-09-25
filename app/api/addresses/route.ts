import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type AddressBody = {
  fullName?: string; phone?: string; line1?: string; line2?: string;
  landmark?: string; city?: string; state?: string; pincode?: string; isDefault?: boolean;
};

function clean(value: unknown, max: number) {
  return String(value ?? '').trim().slice(0, max);
}

function validate(body: AddressBody) {
  const fullName = clean(body.fullName, 80);
  const phone = clean(body.phone, 20);
  const line1 = clean(body.line1, 160);
  const line2 = clean(body.line2, 160);
  const landmark = clean(body.landmark, 120);
  const city = clean(body.city, 80);
  const state = clean(body.state, 80);
  const pincode = clean(body.pincode, 10);
  if (!fullName || !phone || !line1 || !city || !state || !/^[0-9]{6}$/.test(pincode)) return null;
  if (!/^[0-9+()\-\s]{10,20}$/.test(phone)) return null;
  return { full_name: fullName, phone, line1, line2: line2 || null, landmark: landmark || null, city, state, pincode, is_default: Boolean(body.isDefault) };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Unable to load your addresses.' }, { status: 500 });
  return NextResponse.json({ addresses: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  let body: AddressBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const address = validate(body);
  if (!address) return NextResponse.json({ error: 'Please enter a valid name, phone, address and 6-digit pincode.' }, { status: 400 });

  const { count } = await supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
  const isDefault = address.is_default || !count;
  if (isDefault) await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);

  const { data, error } = await supabase.from('addresses').insert({ ...address, is_default: isDefault, user_id: user.id }).select('*').single();
  if (error) return NextResponse.json({ error: 'Unable to save your address.' }, { status: 500 });
  return NextResponse.json({ address: data }, { status: 201 });
}
