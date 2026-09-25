'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { readWishlist, setWishlist } from '@/lib/shop';

let wishlistQueue: Promise<unknown> = Promise.resolve();
function enqueueWishlist<T>(task: () => Promise<T>) {
  const run = wishlistQueue.then(task, task);
  wishlistQueue = run.catch(() => undefined);
  return run;
}

export async function syncWishlist() {
  return enqueueWishlist(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return readWishlist();

    const localIds = readWishlist();
    const { data, error } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id);
    if (error) throw error;

    const remoteIds = (data ?? []).map((row) => row.product_id);
    const mergedIds = [...new Set([...remoteIds, ...localIds])];
    const missingRemote = localIds.filter((productId) => !remoteIds.includes(productId)).map((productId) => ({ user_id: user.id, product_id: productId }));

    if (missingRemote.length) {
      const { error: insertError } = await supabase.from('wishlists').insert(missingRemote);
      if (insertError) throw insertError;
    }

    setWishlist(mergedIds);
    return mergedIds;
  });
}

export async function toggleRemoteWishlist(productId: string) {
  return enqueueWishlist(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: existing, error: lookupError } = await supabase.from('wishlists').select('product_id').eq('user_id', user.id).eq('product_id', productId).maybeSingle();
    if (lookupError) throw lookupError;

    if (existing) {
      const { error } = await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
      if (error) throw error;
      const next = readWishlist().filter((id) => id !== productId);
      setWishlist(next);
      return next;
    }

    const { error } = await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
    if (error) throw error;
    const next = [...new Set([...readWishlist(), productId])];
    setWishlist(next);
    return next;
  });
}

export async function clearRemoteWishlist() {
  return enqueueWishlist(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setWishlist([]); return []; }
    const { error } = await supabase.from('wishlists').delete().eq('user_id', user.id);
    if (error) throw error;
    setWishlist([]);
    return [];
  });
}
