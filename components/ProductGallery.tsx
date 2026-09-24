'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ProductGallery({ title, category, images }: { title:string; category:string; images:string[] }) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const current = list[active] || list[0];
  if (!current) return null;

  return (
    <div className="gallery">
      <div className="gallery-main-wrap">
        <Image className="main-product-image" src={current} alt={title} fill priority sizes="(max-width: 900px) 100vw, 55vw" quality={85} />
        <span className="gallery-label">Z-CLOTHES / {category}</span>
      </div>
      {list.length > 1 && <div className="thumb-row" aria-label="Product images">
        {list.map((image, index) => <button type="button" key={image + index} className={index === active ? 'thumb-button active' : 'thumb-button'} onClick={() => setActive(index)} aria-label={`View image ${index + 1}`} aria-current={index === active}>
          <Image src={image} alt={`${title} image ${index + 1}`} width={76} height={90} sizes="76px" />
        </button>)}
      </div>}
    </div>
  );
}
