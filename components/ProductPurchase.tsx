'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { BuyButton } from '@/components/BuyButton';

export function ProductPurchase({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors?.[0] || '');
  const [size, setSize] = useState(product.sizes?.[0] || '');

  return (
    <>
      {!!product.colors?.length && <div className="option">
        <label>Color <strong>{color}</strong></label>
        <div className="swatches">
          {product.colors.map((c) => <button type="button" key={c} title={c} onClick={()=>setColor(c)} className={color===c?'swatch selected':'swatch'}>{c}</button>)}
        </div>
      </div>}

      {!!product.sizes?.length && <div className="option">
        <label>Size <Link href="/policies#size-guide">Size guide</Link></label>
        <div className="size-row">
          {product.sizes.map((s) => <button type="button" key={s} onClick={()=>setSize(s)} className={size===s?'selected':''}>{s}</button>)}
        </div>
        <small className="selection-note">{color}{color && size ? ' · ' : ''}{size}</small>
      </div>}

      <BuyButton product={product} />
    </>
  );
}
