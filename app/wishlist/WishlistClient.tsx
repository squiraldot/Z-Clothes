'use client';

import Link from 'next/link';
import { Heart } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { readWishlist } from '@/lib/shop';
import { syncWishlist } from '@/lib/wishlist';
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
  return <main className="page wishlist-page">
    <div className="page-hero"><span className="eyebrow">SAVED BY YOU</span><h1>Your Wishlist</h1><p>{saved.length ? `${saved.length} piece${saved.length===1?'':'s'} waiting for you.` : 'Keep your favourites close. Tap the heart on any product to save it.'}</p></div>
    {!saved.length ? <div className="wishlist-empty"><Heart size={34}/><h2>Nothing saved yet.</h2><p>Explore the collection and build your personal edit.</p><Link href="/products" className="btn dark">Explore products →</Link></div> : <div className="product-grid wishlist-grid">{saved.map(product=><ProductCard key={product.id} p={product}/>)}</div>}
  </main>;
}