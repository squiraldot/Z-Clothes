'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowsOut, CaretLeft, CaretRight, X } from '@phosphor-icons/react';

export function ProductGallery({ title, category, images }: { title:string; category:string; images:string[] }) {
  const list = images.filter(Boolean);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const current = list[active] || list[0];

  useEffect(() => {
    if (!zoomed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setZoomed(false);
      if (event.key === 'ArrowRight') setActive((i) => (i + 1) % list.length);
      if (event.key === 'ArrowLeft') setActive((i) => (i - 1 + list.length) % list.length);
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', onKey); };
  }, [zoomed, list.length]);

  if (!current) return null;

  function next() { setActive((i) => (i + 1) % list.length); }
  function previous() { setActive((i) => (i - 1 + list.length) % list.length); }

  return (
    <div className="gallery">
      <div className="gallery-main-wrap">
        <button type="button" className="gallery-zoom-trigger" onClick={() => setZoomed(true)} aria-label="Open product image viewer">
          <Image className="main-product-image" src={current} alt={title} fill priority sizes="(max-width: 900px) 100vw, 55vw" quality={85} />
          <span className="gallery-label">Z-CLOTHES / {category}</span>
          <span className="gallery-zoom-hint"><ArrowsOut size={15}/> View full image</span>
        </button>
      </div>
      {list.length > 1 && <div className="thumb-row" aria-label="Product images">
        {list.map((image, index) => <button type="button" key={image + index} className={index === active ? 'thumb-button active' : 'thumb-button'} onClick={() => setActive(index)} aria-label={`View image ${index + 1}`} aria-current={index === active}>
          <Image src={image} alt={`${title} image ${index + 1}`} width={76} height={90} sizes="76px" />
        </button>)}
      </div>}

      {zoomed && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={`${title} image viewer`} onClick={() => setZoomed(false)}>
        <button type="button" className="gallery-lightbox-close" onClick={() => setZoomed(false)} aria-label="Close image viewer"><X size={24}/></button>
        {list.length > 1 && <button type="button" className="gallery-lightbox-nav prev" onClick={(event) => { event.stopPropagation(); previous(); }} aria-label="Previous image"><CaretLeft size={28}/></button>}
        <div className="gallery-lightbox-image" onClick={(event) => event.stopPropagation()}>
          <Image src={current} alt={title} fill sizes="90vw" quality={90} />
        </div>
        {list.length > 1 && <button type="button" className="gallery-lightbox-nav next" onClick={(event) => { event.stopPropagation(); next(); }} aria-label="Next image"><CaretRight size={28}/></button>}
        <div className="gallery-lightbox-count">{active + 1} / {list.length}</div>
      </div>}
    </div>
  );
}
