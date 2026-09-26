'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { BuyButton } from '@/components/BuyButton';
import { Heart, ShareNetwork, Minus, Plus, Check } from '@phosphor-icons/react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { addToCart, readWishlist, toggleWishlist } from '@/lib/shop';
import { toggleRemoteWishlist } from '@/lib/wishlist';

const sizeGuide = [
  ['S','38–40"','27"'],['M','40–42"','28"'],['L','42–44"','29"'],['XL','44–46"','30"'],['XXL','46–48"','31"'],
];

export function ProductPurchase({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [size, setSize] = useState(product.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const maxQuantity = 20;

  useEffect(() => { setLiked(readWishlist().includes(product.id)); }, [product.id]);
  useEffect(() => {
    if (!sizeGuideOpen) return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setSizeGuideOpen(false)};
    window.addEventListener('keydown',onKey);
    return()=>window.removeEventListener('keydown',onKey);
  },[sizeGuideOpen]);

  function changeQuantity(delta: number) {
    setQuantity((current) => Math.max(1, Math.min(maxQuantity, current + delta)));
  }

  async function toggleLike() {
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const next = await toggleRemoteWishlist(product.id);
        setLiked(Boolean(next?.includes(product.id)));
      } else {
        setLiked(toggleWishlist(product.id).includes(product.id));
      }
    } catch { setLiked(readWishlist().includes(product.id)); }
  }

  async function shareProduct() {
    const url = new URL(window.location.pathname + window.location.search, window.location.origin).toString();
    try {
      if (navigator.share) await navigator.share({ title: product.title, text: product.title + '\n' + url, url });
      else { await navigator.clipboard.writeText(url); setShared(true); window.setTimeout(() => setShared(false), 1800); }
    } catch {}
  }

  function stickyAdd() {
    addToCart(product, { color, size, quantity });
  }

  return (
    <>
      {!!product.colors?.length && <div className="option">
        <label>Color <strong>{color}</strong></label>
        <div className="swatches">{product.colors.map((c) => <button type="button" key={c} title={c} aria-label={'Select ' + c} onClick={() => setColor(c)} className={color===c ? 'swatch selected' : 'swatch'}>{c}</button>)}</div>
      </div>}

      {!!product.sizes?.length && <div className="option">
        <label>Size <button type="button" className="size-guide-trigger" onClick={()=>setSizeGuideOpen(true)}>Size guide</button></label>
        <div className="size-row">{product.sizes.map((s) => <button type="button" key={s} aria-label={'Select size ' + s} onClick={() => setSize(s)} className={size===s ? 'selected' : ''}>{s}</button>)}</div>
        <small className="selection-note">{color}{color && size ? ' · ' : ''}{size}</small>
      </div>}

      <div className="availability"><span className="availability-dot" aria-hidden="true"/><strong>Available to order</strong><small>{color}{color && size ? ' · ' : ''}{size}</small></div>

      <div className="quantity-option">
        <label>Quantity <strong>{quantity}</strong></label>
        <div className="quantity-control">
          <button type="button" onClick={() => changeQuantity(-1)} aria-label="Decrease quantity" disabled={quantity <= 1}><Minus size={15}/></button>
          <span>{quantity}</span>
          <button type="button" onClick={() => changeQuantity(1)} aria-label="Increase quantity" disabled={quantity >= maxQuantity}><Plus size={15}/></button>
        </div>
      </div>

      <div className="product-action-row">
        <BuyButton product={product} color={color} size={size} quantity={quantity} />
        <div className="secondary-actions">
          <button type="button" className={liked ? 'product-icon-action active' : 'product-icon-action'} onClick={toggleLike} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}><Heart size={19} weight={liked ? 'fill' : 'regular'}/></button>
          <button type="button" className="product-icon-action" onClick={shareProduct} aria-label="Share product">{shared ? <Check size={19}/> : <ShareNetwork size={19}/>}</button>
        </div>
      </div>

      <button type="button" className="mobile-sticky-add" onClick={stickyAdd}><span><b>₹{product.price.toLocaleString('en-IN')}</b><small>{color}{color&&size?' · ':''}{size}</small></span><strong>Add to Bag</strong></button>

      {sizeGuideOpen && <div className="size-guide-modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-title" onClick={()=>setSizeGuideOpen(false)}>
        <div className="size-guide-card" onClick={event=>event.stopPropagation()}>
          <button type="button" className="size-guide-close" onClick={()=>setSizeGuideOpen(false)} aria-label="Close size guide">×</button>
          <span className="eyebrow dark">FIND YOUR FIT</span><h2 id="size-guide-title">Size Guide</h2>
          <p>Measure around the fullest part of your chest. All measurements are approximate.</p>
          <div className="size-guide-table"><div>Size</div><div>Chest</div><div>Length</div>{sizeGuide.map(row=>row.map((cell,i)=><div key={row[0] + '-' + i}>{cell}</div>))}</div>
          <Link href="/policies#size-guide" onClick={()=>setSizeGuideOpen(false)}>View full guide →</Link>
        </div>
      </div>}
    </>
  );
}
