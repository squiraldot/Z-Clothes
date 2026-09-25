import type { CartItem } from '@/lib/shop';
import { cartItemKey, readCart, setCart } from '@/lib/shop';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

function toRow(userId: string, item: CartItem) {
  return {
    user_id: userId,
    item_key: cartItemKey(item),
    product_id: item.productId,
    title: item.title,
    price: item.price,
    image: item.image,
    quantity: item.quantity,
    color: item.color || null,
    size: item.size || null,
    dodo_product_id: item.dodoProductId || null,
  };
}

function fromRow(row: any): CartItem {
  return {
    productId: row.product_id,
    title: row.title,
    price: Number(row.price || 0),
    image: row.image,
    quantity: Number(row.quantity || 1),
    color: row.color || '',
    size: row.size || '',
    dodoProductId: row.dodo_product_id || '',
  };
}

export async function syncCart() {
  if (typeof window === 'undefined') return [];
  const supabase = createSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return readCart();

  const [{ data: remoteRows, error: readError }] = await Promise.all([
    supabase.from('cart_items').select('*').eq('user_id', user.id),
  ]);
  if (readError) throw readError;

  const local = readCart();
  const localKeys = new Set(local.map(cartItemKey));
  const remoteOnly = (remoteRows ?? []).filter((row: any) => !localKeys.has(row.item_key)).map(fromRow);
  const merged = [...local, ...remoteOnly];

  if (merged.length) {
    const { error } = await supabase
      .from('cart_items')
      .upsert(merged.map((item) => toRow(user.id, item)), { onConflict: 'user_id,item_key' });
    if (error) throw error;
  }

  setCart(merged);
  return merged;
}

export async function syncCartToRemote() {
  if (typeof window === 'undefined') return;
  const supabase = createSupabaseBrowserClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return;

  const local = readCart();
  const { data: remoteRows, error: readError } = await supabase
    .from('cart_items')
    .select('item_key')
    .eq('user_id', user.id);
  if (readError) throw readError;

  if (local.length) {
    const { error } = await supabase
      .from('cart_items')
      .upsert(local.map((item) => toRow(user.id, item)), { onConflict: 'user_id,item_key' });
    if (error) throw error;
  }

  const localKeys = new Set(local.map(cartItemKey));
  const staleKeys = (remoteRows ?? [])
    .map((row: any) => row.item_key)
    .filter((key: string) => !localKeys.has(key));

  if (staleKeys.length) {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .in('item_key', staleKeys);
    if (error) throw error;
  }
}
