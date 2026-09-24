'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { CaretDown, MagnifyingGlass, X } from '@phosphor-icons/react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQ(params.get('search') || params.get('q') || '');
    setCategory(params.get('category') || 'All');
    fetch('/api/products').then((r) => { if (!r.ok) throw new Error('Product request failed'); return r.json(); }).then((data) => setProducts(Array.isArray(data) ? data : [])).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set('search', q); else url.searchParams.delete('search');
    if (category !== 'All') url.searchParams.set('category', category); else url.searchParams.delete('category');
    window.history.replaceState({}, '', url.toString());
  }, [q, category]);

  const cats = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filtered = useMemo(() => {
    const result = products.filter((p) =>
      (category === 'All' || p.category === category) &&
      `${p.title} ${p.category} ${p.description}`.toLowerCase().includes(q.toLowerCase()),
    );
    return [...result].sort((a, b) => {
      if (sort === 'Price: Low') return a.price - b.price;
      if (sort === 'Price: High') return b.price - a.price;
      return 0;
    });
  }, [products, category, q, sort]);

  return (
    <main className="products-page">
      <section className="products-hero">
        <Image src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2200&q=90" alt="" fill priority sizes="100vw" quality={82} />
        <div className="products-hero-overlay" />
        <div className="products-hero-copy">
          <span className="eyebrow">THE FULL EDIT</span>
          <h1>All Products</h1>
          <p>{q ? `Showing results for “${q}”.` : category !== 'All' ? `Exploring the ${category} edit.` : 'Discover our complete collection of premium clothing.'}</p>
        </div>
      </section>
      <section className="catalog">
        <div className="catalog-topline">
          <div><span className="catalog-count">{filtered.length} PRODUCTS</span><h2>{q || category !== 'All' ? 'Your edit' : 'Shop the collection'}</h2></div>
          <label className="catalog-search"><MagnifyingGlass size={17}/><input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search for clothes..." aria-label="Search products"/>{q&&<button type="button" className="search-clear" onClick={()=>setQ('')} aria-label="Clear search"><X size={15}/></button>}</label>
        </div>
        <div className="category-bar">
          <div className="category-scroll" aria-label="Product categories">{cats.map(c=><button className={category===c?'category-pill active':'category-pill'} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div>
          <label className="sort-control"><span>Sort by</span><select value={sort} onChange={(e)=>setSort(e.target.value)} aria-label="Sort products"><option>Newest</option><option>Price: Low</option><option>Price: High</option></select><CaretDown size={14}/></label>
        </div>
        <div className="mobile-search"><MagnifyingGlass size={17}/><input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search for clothes..." aria-label="Search products"/>{q&&<button type="button" className="search-clear" onClick={()=>setQ('')} aria-label="Clear search"><X size={15}/></button>}</div>
        {error ? <div className="empty error-inline"><p>We could not load the collection right now.</p><button className="drawer-link" onClick={()=>window.location.reload()}>Try again →</button></div> : loading ? <div className="catalog-loading" aria-live="polite">Loading the collection…</div> : <div className="product-grid">{filtered.map((p)=><ProductCard key={p.id} p={p}/>)}</div>}
        {filtered.length===0&&<div className="empty"><p>No products match this edit.</p>{(q||category!=='All')&&<button className="drawer-link" onClick={()=>{setQ('');setCategory('All')}}>Reset filters →</button>}</div>}
      </section>
    </main>
  );
}
