'use client';

import { useState } from 'react';
import type { Product } from '@/lib/types';
import { CheckCircle, LockKey, X } from '@phosphor-icons/react';

type CartItem = {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  dodoProductId: string;
};

function addItem(product: Product) {
  const current: CartItem[] = JSON.parse(localStorage.getItem('zclothes-cart') || '[]');
  const existing = current.find((x) => x.productId === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    current.push({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: 1,
      dodoProductId: product.dodoProductId || '',
    });
  }

  localStorage.setItem('zclothes-cart', JSON.stringify(current));
}

export function BuyButton({ product }: { product: Product }) {
  const [showCongratulations, setShowCongratulations] = useState(false);

  function add() {
    addItem(product);
    window.dispatchEvent(new CustomEvent('zclothes:cart-updated'));
  }

  function buy() {
    // Payments are intentionally disabled until Dodo verification is complete.
    setShowCongratulations(true);
  }

  return (
    <>
      <div className="buy-stack">
        <button className="add-cart" onClick={add}>
          Add to Bag
        </button>

        <button className="dodo-btn" onClick={buy}>
          <LockKey size={18} />
          Buy Now
        </button>
      </div>

      {showCongratulations && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Congratulations"
          onClick={() => setShowCongratulations(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
            background: 'rgba(0,0,0,.72)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(420px, 100%)',
              padding: '42px 28px 34px',
              borderRadius: '28px',
              background: '#fff',
              color: '#111',
              textAlign: 'center',
              boxShadow: '0 30px 100px rgba(0,0,0,.35)',
            }}
          >
            <button
              type="button"
              onClick={() => setShowCongratulations(false)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 16,
                right: 16,
                border: 0,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <CheckCircle size={64} weight="fill" style={{ marginBottom: 16 }} />
            <div
              style={{
                fontSize: 13,
                letterSpacing: '.18em',
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Z-CLOTHES
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: 34, lineHeight: 1.05 }}>
              Congratulations 🎉
            </h2>
            <p style={{ margin: 0, color: '#666', lineHeight: 1.6 }}>
              Your selection is ready. Payments are coming soon.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
