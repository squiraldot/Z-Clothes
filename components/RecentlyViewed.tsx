'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

const KEY='zclothes-recently-viewed';
const LIMIT=8;

export function rememberRecentlyViewed(id:string){
  try{
    const ids=JSON.parse(localStorage.getItem(KEY)||'[]') as string[];
    localStorage.setItem(KEY,JSON.stringify([id,...ids.filter(item=>item!==id)].slice(0,LIMIT)));
    window.dispatchEvent(new Event('zclothes:recently-viewed'));
  }catch{}
}

export function RecentlyViewed(){
  const [products,setProducts]=useState<Product[]>([]);
  const [ids,setIds]=useState<string[]>([]);
  useEffect(()=>{
    const read=()=>{try{setIds(JSON.parse(localStorage.getItem(KEY)||'[]') as string[])}catch{setIds([])}};
    read();
    fetch('/api/products').then(response=>response.ok?response.json():[]).then(data=>setProducts(Array.isArray(data)?data:[])).catch(()=>{});
    window.addEventListener('zclothes:recently-viewed',read);
    return()=>window.removeEventListener('zclothes:recently-viewed',read);
  },[]);
  const items=useMemo(()=>{const map=new Map(products.map(product=>[product.id,product]));return ids.map(id=>map.get(id)).filter(Boolean) as Product[]},[ids,products]);
  if(!items.length)return null;
  return <section className="product-discovery-section"><div className="section-head"><div><span className="eyebrow dark">YOUR HISTORY</span><h2>Recently Viewed</h2></div></div><div className="rail">{items.map(product=><ProductCard key={product.id} p={product}/>)}</div></section>;
}
