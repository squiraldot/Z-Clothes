'use client';

import Link from 'next/link';
import { Heart, ShoppingBag, Trash } from '@phosphor-icons/react';
import { addToCart, setWishlist } from '@/lib/shop';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { readWishlist } from '@/lib/shop';
import { clearRemoteWishlist, syncWishlist } from '@/lib/wishlist';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { Product } from '@/lib/types';

export default function WishlistClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    let active = true;
    syncWishlist().then((next) => { if (active) setIds(next); }).catch(() => { if (active) setIds(readWishlist()); });
    fetch('/api/products').then((r) => r.json()).then((data) => setProducts(Array.isArray(data) ? data : []));
    const handler = () => setIds(readWishlist());
    window.addEventListener('zclothes:wishlist-updated', handler);
    return () => { active = false; window.removeEventListener('zclothes:wishlist-updated', handler); };
  }, []);
  const saved = useMemo(() => products.filter((product) => ids.includes(product.id)), [products, ids]);
  function addAllToBag(){ saved.forEach(product=>addToCart(product)); }
  async function clearWishlist(){ try { await clearRemoteWishlist(); setIds([]); } catch { setIds(readWishlist()); } }
  return <main className="page wishlist-page">
    <div className="page-hero"><span className="eyebrow">SAVED BY YOU</span><h1>Your Wishlist</h1><p>{saved.length ? `${saved.length} piece${saved.length===1?'':'s'} waiting for you.` : 'Keep your favourites close. Tap the heart on any product to save it.'}</p></div>
    {!saved.length ? <div className="wishlist-empty"><Heart size={34}/><h2>Nothing saved yet.</h2><p>Explore the collection and build your personal edit.</p><Link href="/products" className="btn dark">Explore products →</Link></div> : <>
      <div className="wishlist-toolbar"><div><span className="eyebrow dark">YOUR SAVED EDIT</span><strong>{saved.length} {saved.length===1?'piece':'pieces'}</strong></div><div className="wishlist-toolbar-actions"><button className="btn light" type="button" onClick={clearWishlist}><Trash size={15}/> Clear all</button><button className="btn dark" type="button" onClick={addAllToBag}><ShoppingBag size={15}/> Add all to bag</button></div></div>
      <div className="product-grid wishlist-grid">{saved.map(product=><ProductCard key={product.id} p={product}/>)}</div>
    </>}
  </main>;
}