'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { BuyButton } from '@/components/BuyButton';
import { Heart, ShareNetwork, Minus, Plus, Check } from '@phosphor-icons/react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { readWishlist, toggleWishlist } from '@/lib/shop';
import { toggleRemoteWishlist } from '@/lib/wishlist';

export function ProductPurchase({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [size, setSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    setLiked(readWishlist().includes(product.id));
  }, [product.id]);

  function changeQuantity(delta: number) {
    setQuantity((current) => Math.max(1, Math.min(20, current + delta)));
  }

  async function toggleLike() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const next = await toggleRemoteWishlist(product.id);
        setLiked(next.includes(product.id));
      } else {
        setLiked(toggleWishlist(product.id).includes(product.id));
      }
    } catch {
      setLiked(readWishlist().includes(product.id));
    }
  }

  async function shareProduct() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, text: product.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      }
    } catch {}
  }

  return (
    <>
      {!!product.colors?.length && <div className="option">
        <label>Color <strong>{color}</strong></label>
        <div className="swatches">
          {product.colors.map((c) => (
            <button type="button" key={c} title={c} aria-label={`Select ${c}`} onClick={() => setColor(c)} className={color===c ? 'swatch selected' : 'swatch'}>{c}</button>
          ))}
        </div>
      </div>}

      {!!product.sizes?.length && <div className="option">
        <label>Size <Link href="/policies#size-guide">Size guide</Link></label>
        <div className="size-row">
          {product.sizes.map((s) => (
            <button type="button" key={s} aria-label={`Select size ${s}`} onClick={() => setSize(s)} className={size===s ? 'selected' : ''}>{s}</button>
          ))}
        </div>
        <small className="selection-note">{color}{color && size ? ' · ' : ''}{size}</small>
      </div>}

      <div className="quantity-option">
        <label>Quantity <strong>{quantity}</strong></label>
        <div className="quantity-control">
          <button type="button" onClick={() => changeQuantity(-1)} aria-label="Decrease quantity" disabled={quantity <= 1}><Minus size={15}/></button>
          <span>{quantity}</span>
          <button type="button" onClick={() => changeQuantity(1)} aria-label="Increase quantity" disabled={quantity >= 20}><Plus size={15}/></button>
        </div>
      </div>

      <div className="product-action-row">
        <BuyButton product={product} color={color} size={size} quantity={quantity} />
        <div className="secondary-actions">
          <button type="button" className={liked ? 'product-icon-action active' : 'product-icon-action'} onClick={toggleLike} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={19} weight={liked ? 'fill' : 'regular'}/></button>
          <button type="button" className="product-icon-action" onClick={shareProduct} aria-label="Share product">{shared ? <Check size={19}/> : <ShareNetwork size={19}/>}</button>
        </div>
      </div>
    </>
  );
}
