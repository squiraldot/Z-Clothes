'use client';

import { useEffect, useMemo, useState } from 'react';
import { CaretDown, MagnifyingGlass } from '@phosphor-icons/react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Newest');

  useEffect(() => {
    fetch('/api/products').then((r) => r.json()).then(setProducts);
  }, []);

  const cats = ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  const filtered = useMemo(() => {
    const result = products.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        `${p.title} ${p.category}`.toLowerCase().includes(q.toLowerCase()),
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
        <img src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2200&q=90" alt="" />
        <div className="products-hero-overlay" />
        <div className="products-hero-copy">
          <span className="eyebrow">THE FULL EDIT</span>
          <h1>All Products</h1>
          <p>Discover our complete collection of premium clothing.</p>
        </div>
      </section>

      <section className="catalog">
        <div className="catalog-topline">
          <div>
            <span className="catalog-count">{filtered.length} PRODUCTS</span>
            <h2>Shop the collection</h2>
          </div>
          <label className="catalog-search">
            <MagnifyingGlass size={17} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for clothes..." aria-label="Search products" />
          </label>
        </div>

        <div className="category-bar">
          <div className="category-scroll" aria-label="Product categories">
            {cats.map((c) => (
              <button className={category === c ? 'category-pill active' : 'category-pill'} onClick={() => setCategory(c)} key={c}>
                {c}
              </button>
            ))}
          </div>

          <label className="sort-control">
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
              <option>Newest</option>
              <option>Price: Low</option>
              <option>Price: High</option>
            </select>
            <CaretDown size={14} />
          </label>
        </div>

        <div className="mobile-search">
          <MagnifyingGlass size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for clothes..." aria-label="Search products" />
        </div>

        <div className="product-grid">
          {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>

        {filtered.length === 0 && <div className="empty">No products match that search.</div>}
      </section>
    </main>
  );
}
