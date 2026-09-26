'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

const KEY='zclothes-recently-viewed';
const LIMIT=8;

export function rememberRecentlyViewed(id:string){
  try {
    const current=JSON.parse(localStorage.getItem(KEY)||'[]') as string[];
    localStorage.setItem(KEY,JSON.stringify([id,...current.filter(x=>x!==id)].slice(0,LIMIT)));
    window.dispatchEvent(new CustomEvent('zclothes:recently-viewed'));
  } catch {}
}

export function RecentlyViewed({ products }: { products: Product[] }) {
  const [items,setItems]=useState<Product[]>([]);
  function refresh(){
    try {
      const ids=JSON.parse(localStorage.getItem(KEY)||'[]') as string[];
      const map=new Map(products.map(p=>[p.id,p]));
      setItems(ids.map(id=>map.get(id)).filter(Boolean) as Product[]);
    } catch { setItems([]); }
  }
  useEffect(()=>{refresh();window.addEventListener('zclothes:recently-viewed',refresh);return()=>window.removeEventListener('zclothes:recently-viewed',refresh)},[products]);
  if(!items.length)return null;
  return <section className="product-discovery-section"><div className="section-head"><div><span className="eyebrow dark">YOUR HISTORY</span><h2>Recently Viewed</h2></div></div><div className="rail">{items.map(p=><ProductCard key={p.id} p={p}/>)}</div></section>;
}
