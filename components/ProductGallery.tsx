'use client';

import { useState } from 'react';

export function ProductGallery({ title, category, images }: { title:string; category:string; images:string[] }) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const current = list[active] || list[0];

  return (
    <div className="gallery">
      <div className="gallery-main-wrap">
        <img className="main-product-image" src={current} alt={title} />
        <span className="gallery-label">Z-CLOTHES / {category}</span>
      </div>
      {list.length > 1 && (
        <div className="thumb-row" aria-label="Product images">
          {list.map((image, index) => (
            <button
              type="button"
              key={image + index}
              className={index === active ? 'thumb-button active' : 'thumb-button'}
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
            >
              <img src={image} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
