'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { useEffect, useRef, useState } from 'react';

export function ImmersiveHero() {
  const ref = useRef<HTMLElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const move = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      setPointer({
        x: ((event.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((event.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };
    const leave = () => setPointer({ x: 0, y: 0 });
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerleave', leave);
    return () => {
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerleave', leave);
    };
  }, []);

  const style = (depth: number) => ({
    transform: `translate3d(${pointer.x * depth}px, ${pointer.y * depth}px, 0)`,
  });

  return (
    <section className="hero hero-immersive" ref={ref}>
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-media hero-layer-back" style={style(-7)}>
        <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=90" alt="Z-Clothes campaign" />
      </div>
      <div className="hero-orbit orbit-one" style={style(16)} aria-hidden="true"><span>Z</span></div>
      <div className="hero-orbit orbit-two" style={style(-12)} aria-hidden="true"><span>01</span></div>
      <div className="hero-copy hero-layer-front" style={style(5)}>
        <span className="eyebrow">PREMIUM CLOTHING FOR MODERN PEOPLE</span>
        <h1>Wear<br/><em>Your Story.</em></h1>
        <p>Discover premium quality clothing crafted for modern confidence, everyday movement and timeless style.</p>
        <div className="hero-actions">
          <Link href="/products" className="btn light">Shop now <ArrowRight/></Link>
          <Link href="/about" className="story-link">Watch our story <ArrowUpRight/></Link>
        </div>
        <div className="hero-stats">
          <span><b>10K+</b> Happy customers</span>
          <span><b>500+</b> Products</span>
          <span><b>4.8★</b> Average rating</span>
        </div>
      </div>
      <div className="hero-scroll">SCROLL TO EXPLORE <span>↓</span></div>
    </section>
  );
}
