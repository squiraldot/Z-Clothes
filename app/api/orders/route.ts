import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProducts } from '@/lib/blogger';

type BodyItem = { productId?: string; quantity?: number; color?: string; size?: string };\ntype Body = { items?: BodyItem[]; addressId?: string };

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let body: Body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];\n  const addressId = String(body.addressId || '');\n  if (!addressId) return NextResponse.json({ error: 'Please select a delivery address.' }, { status: 400 });\n\n  const { data: address, error: addressError } = await supabase\n    .from('addresses')\n    .select('id,full_name,phone,line1,line2,landmark,city,state,pincode')\n    .eq('id', addressId).eq('user_id', user.id).maybeSingle();\n  if (addressError || !address) return NextResponse.json({ error: 'Selected delivery address is unavailable.' }, { status: 400 });
  if (!rawItems.length) return NextResponse.json({ error: 'Your bag is empty.' }, { status: 400 });

  const products = await getProducts();
  const items = rawItems.map((item) => {
    const productId = String(item.productId || '');
    const product = products.find((candidate) => candidate.id === productId);
    const quantity = Math.floor(Number(item.quantity));
    const color = item.color ? String(item.color) : null;
    const size = item.size ? String(item.size) : null;
    const validColor = !color || product?.colors.includes(color);
    const validSize = !size || product?.sizes.includes(size);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 || !validColor || !validSize) return null;
    return {
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.image,
      quantity,
      color,
      size,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  if (!items.length) return NextResponse.json({ error: 'Your bag contains unavailable items.' }, { status: 400 });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderNumber = 'ZC-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomUUID().slice(0, 6).toUpperCase();

  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: user.id, order_number: orderNumber, status: 'pending_payment',
    currency: 'INR', subtotal, shipping: 0, total: subtotal, email: user.email ?? null,\n    shipping_address_id: address.id, shipping_name: address.full_name, shipping_phone: address.phone,\n    shipping_line1: address.line1, shipping_line2: address.line2, shipping_landmark: address.landmark,\n    shipping_city: address.city, shipping_state: address.state, shipping_pincode: address.pincode,
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
