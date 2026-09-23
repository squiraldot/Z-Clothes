'use client';

import Link from 'next/link';
import { Heart, Plus } from '@phosphor-icons/react';
import { useState } from 'react';
import type { Product } from '@/lib/types';

export function ProductCard({ p }: { p: Product }) {
  const [liked, setLiked] = useState(false);

  function quickAdd(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const current = JSON.parse(localStorage.getItem('zclothes-cart') || '[]');
    const existing = current.find((x: any) => x.productId === p.id);
    if (existing) existing.quantity += 1;
    else current.push({
      productId: p.id, title: p.title, price: p.price, image: p.image,
      quantity: 1, dodoProductId: p.dodoProductId || '',
    });
    localStorage.setItem('zclothes-cart', JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('zclothes:cart-updated'));
  }

  function toggleWishlist(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setLiked((value) => !value);
  }

  return (
    <Link href={`/products/${p.slug}`} className="product-card">
      <div className="product-image">
        <img src={p.image} alt={p.title} />
        {p.images?.[0] && <img className="product-hover-image" src={p.images[0]} alt="" aria-hidden="true" />}
        {p.labels[0] && <span className="tag">{p.labels[0]}</span>}
        <button className={liked ? 'wish liked' : 'wish'} onClick={toggleWishlist} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}>
          <Heart size={16} weight={liked ? 'fill' : 'regular'} />
        </button>
        <button className="quick-add" onClick={quickAdd} aria-label={`Quick add ${p.title}`}>
          <Plus size={16} />
          <span>Quick add</span>
        </button>
      </div>
      <div className="product-meta">
        <div><h3>{p.title}</h3><p>{p.category}</p></div>
        <strong>₹{p.price.toLocaleString('en-IN')}</strong>
      </div>
    </Link>
  );
}
