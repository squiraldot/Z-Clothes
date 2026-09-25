'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Plus } from '@phosphor-icons/react';
import { useEffect, useState, type MouseEvent } from 'react';
import type { Product } from '@/lib/types';
import { addToCart, readWishlist, toggleWishlist } from '@/lib/shop';
import { toggleRemoteWishlist } from '@/lib/wishlist';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function ProductCard({ p }: { p: Product }) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLiked(readWishlist().includes(p.id));
    const handler = () => setLiked(readWishlist().includes(p.id));
    window.addEventListener('zclothes:wishlist-updated', handler);
    return () => window.removeEventListener('zclothes:wishlist-updated', handler);
  }, [p.id]);

  function quickAdd(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    addToCart(p);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  async function toggleLike(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const next = await toggleRemoteWishlist(p.id);
        setLiked(Boolean(next?.includes(p.id)));
      } else {
        setLiked(toggleWishlist(p.id).includes(p.id));
      }
    } catch {
      setLiked(readWishlist().includes(p.id));
    }
  }

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link href={`/products/${p.slug}`} className="product-card-link" aria-label={`View ${p.title}`}>
          <div className="product-image">
            <Image src={p.image} alt={p.title} fill sizes="(max-width: 560px) 48vw, (max-width: 900px) 48vw, 25vw" />
            {p.images?.[0] && <Image className="product-hover-image" src={p.images[0]} alt="" fill sizes="(max-width: 560px) 48vw, (max-width: 900px) 48vw, 25vw" aria-hidden="true" />}
            {p.labels[0] && <span className="tag">{p.labels[0]}</span>}
          </div>
        </Link>
        <div className="product-card-actions" aria-label="Product actions">
          <button className={liked ? 'wish liked' : 'wish'} onClick={toggleLike} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={20} weight={liked ? 'fill' : 'regular'} /></button>
          <button className={added ? 'quick-add added' : 'quick-add'} onClick={quickAdd} aria-label={`Quick add ${p.title}`}><Plus size={16}/><span>{added ? 'Added to bag' : 'Quick add'}</span></button>
        </div>
      </div>
      <Link href={`/products/${p.slug}`} className="product-meta">
        <div><h3>{p.title}</h3><p>{p.category}</p></div><strong>₹{p.price.toLocaleString('en-IN')}</strong>
      </Link>
    </article>
  );
}
