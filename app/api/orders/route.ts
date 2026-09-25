import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type BodyItem = {
  productId?: string;
  title?: string;
  price?: number;
  image?: string;
  quantity?: number;
  color?: string;
  size?: string;
};

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let body: { items?: BodyItem[] };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems.map((item) => ({
    productId: String(item.productId || ''),
    title: String(item.title || '').trim(),
    price: Number(item.price),
    image: String(item.image || ''),
    quantity: Math.floor(Number(item.quantity)),
    color: item.color ? String(item.color) : null,
    size: item.size ? String(item.size) : null,
  })).filter((item) =>
    item.productId && item.title && item.image &&
    Number.isFinite(item.price) && item.price >= 0 &&
    Number.isInteger(item.quantity) && item.quantity > 0
  );

  if (!items.length) return NextResponse.json({ error: 'Your bag is empty.' }, { status: 400 });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderNumber = 'ZC-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomUUID().slice(0, 6).toUpperCase();

  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: user.id, order_number: orderNumber, status: 'pending_payment',
    currency: 'INR', subtotal, shipping: 0, total: subtotal, email: user.email ?? null,
  }).select('id, order_number, status, total, currency').single();

  if (orderError || !order) return NextResponse.json({ error: 'Unable to create your order draft.' }, { status: 500 });

  const { error: itemError } = await supabase.from('order_items').insert(items.map((item) => ({
    order_id: order.id, product_id: item.productId, title: item.title, price: item.price,
    quantity: item.quantity, image: item.image, color: item.color, size: item.size,
  })));

  if (itemError) {
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: 'Unable to save your order items.' }, { status: 500 });
  }

  return NextResponse.json({ order }, { status: 201 });
}
