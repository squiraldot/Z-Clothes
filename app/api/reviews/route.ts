import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type ReviewBody = { productId?: string; orderId?: string; rating?: number; title?: string; body?: string };

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ eligible: false, review: null, orderId: null });

  const productId = new URL(request.url).searchParams.get('productId') || '';
  if (!productId) return NextResponse.json({ eligible: false, review: null, orderId: null });

  const { data: orders } = await supabase.from('orders').select('id').eq('user_id', user.id).eq('status', 'delivered');
  const orderIds = (orders || []).map((order) => order.id);
  if (!orderIds.length) return NextResponse.json({ eligible: false, review: null, orderId: null });

  const { data: items } = await supabase.from('order_items').select('order_id').eq('product_id', productId).in('order_id', orderIds);
  const orderId = items?.[0]?.order_id || null;
  const { data: review } = await supabase.from('product_reviews').select('id,order_id,rating,title,body,created_at,updated_at').eq('user_id', user.id).eq('product_id', productId).maybeSingle();

  return NextResponse.json({ eligible: Boolean(orderId), review: review || null, orderId });
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in to review this piece.' }, { status: 401 });

  let body: ReviewBody;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const productId = String(body.productId || '');
  const orderId = String(body.orderId || '');
  const rating = Math.floor(Number(body.rating));
  const title = String(body.title || '').trim().slice(0, 100);
  const reviewBody = String(body.body || '').trim().slice(0, 1000);

  if (!productId || !orderId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Please choose a rating and try again.' }, { status: 400 });
  }
  if (!reviewBody && !title) return NextResponse.json({ error: 'Please add a short review.' }, { status: 400 });

  const { data: orderItem } = await supabase
    .from('order_items').select('order_id').eq('order_id', orderId).eq('product_id', productId).maybeSingle();
  const { data: order } = await supabase.from('orders').select('id').eq('id', orderId).eq('user_id', user.id).eq('status', 'delivered').maybeSingle();

  if (!orderItem || !order) return NextResponse.json({ error: 'Reviews are available after a delivered order.' }, { status: 403 });

  const { data: review, error } = await supabase.from('product_reviews').upsert({
    user_id: user.id, product_id: productId, order_id: orderId, rating, title: title || null, body: reviewBody || null
  }, { onConflict: 'user_id,product_id' }).select('id,order_id,rating,title,body,created_at,updated_at').single();

  if (error) return NextResponse.json({ error: 'Unable to save your review right now.' }, { status: 500 });
  return NextResponse.json({ review }, { status: 200 });
}
