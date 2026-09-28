'use client';

import { ShoppingBag } from '@phosphor-icons/react';
import { useState } from 'react';
import { cartItemKey, readCart, writeCart, type CartItem } from '@/lib/shop';

type Props = {
  items: CartItem[];
};

export default function ReorderButton({ items }: Props) {
  const [added, setAdded] = useState(false);

  function reorder() {
    const current = readCart();
    const next = [...current];

    for (const item of items) {
      const index = next.findIndex((entry) => cartItemKey(entry) === cartItemKey(item));
      if (index >= 0) {
        next[index] = {
          ...next[index],
          quantity: Math.min(20, next[index].quantity + item.quantity),
        };
      } else {
        next.push({ ...item });
      }
    }

    writeCart(next);
    setAdded(true);
  }

  return (
    <button className="btn light reorder-button" type="button" onClick={reorder} disabled={!items.length}>
      <ShoppingBag size={15} />
      {added ? 'Added to bag' : 'Buy again'}
    </button>
  );
}
