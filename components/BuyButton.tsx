'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { addToCart } from '@/lib/shop';
import { CheckCircle, LockKey, X } from '@phosphor-icons/react';

type Props = { product: Product; color?: string; size?: string };

export function BuyButton({ product, color, size }: Props) {
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [added, setAdded] = useState(false);

  function add() {
    addToCart(product, { color, size });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  }

  function buy() {
    addToCart(product, { color, size });
    setShowCongratulations(true);
  }

  useEffect(() => {
    if (!showCongratulations) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowCongratulations(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showCongratulations]);

  return (
    <>
      <div className="buy-stack">
        <button type="button" className={added ? 'add-cart added' : 'add-cart'} onClick={add}>
          {added ? 'Added to Bag ✓' : 'Add to Bag'}
        </button>
        <button type="button" className="dodo-btn" onClick={buy}>
          <LockKey size={18} /> Buy Now
        </button>
      </div>

      {showCongratulations && (
        <div className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="buy-now-title" onClick={() => setShowCongratulations(false)}>
          <div className="checkout-modal-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowCongratulations(false)} aria-label="Close">
              <X size={20} />
            </button>
            <CheckCircle size={58} weight="fill" />
            <span className="eyebrow dark">Z-CLOTHES</span>
            <h2 id="buy-now-title">Added to your bag 🎉</h2>
            <p>Your selection has been saved. Secure payments will be available after verification.</p>
            <div className="modal-actions">
              <button type="button" className="btn outline" onClick={() => setShowCongratulations(false)}>Continue shopping</button>
              <Link href="/checkout" className="btn dark" onClick={() => setShowCongratulations(false)}>View bag →</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
