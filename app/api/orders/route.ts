import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getProducts } from '@/lib/blogger';

type BodyItem = { productId?: string; quantity?: number; color?: string; size?: string };
type Body = { items?: BodyItem[]; addressId?: string; couponCode?: string };

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  let body: Body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const rawItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  const addressId = String(body.addressId || '');
  const couponCode = String(body.couponCode || '').trim().slice(0, 40);
  if (!addressId) return NextResponse.json({ error: 'Please select a delivery address.' }, { status: 400 });

  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .select('id,full_name,phone,line1,line2,landmark,city,state,pincode')
    .eq('id', addressId).eq('user_id', user.id).maybeSingle();
  if (addressError || !address) return NextResponse.json({ error: 'Selected delivery address is unavailable.' }, { status: 400 });
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
    currency: 'INR', subtotal, shipping: 0, total: subtotal, email: user.email ?? null,
    shipping_address_id: address.id, shipping_name: address.full_name, shipping_phone: address.phone,
    shipping_line1: address.line1, shipping_line2: address.line2, shipping_landmark: address.landmark,
    shipping_city: address.city, shipping_state: address.state, shipping_pincode: address.pincode,
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

  if (couponCode) {
    const { data: coupon, error: couponError } = await supabase.rpc('redeem_coupon', {
      p_code: couponCode, p_order_id: order.id, p_user_id: user.id, p_subtotal: subtotal,
    });
    if (couponError || !coupon?.[0]) {
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json({ error: couponError?.message || 'Unable to apply this coupon.' }, { status: 400 });
    }
    return NextResponse.json({ order: { ...order, coupon_code: coupon[0].coupon_code, discount: coupon[0].discount_amount, total: Math.max(0, subtotal - Number(coupon[0].discount_amount)) } }, { status: 201 });
  }

  return NextResponse.json({ order }, { status: 201 });
}
