'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { CaretDown, Funnel, MagnifyingGlass, X } from '@phosphor-icons/react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/lib/types';

const SORTS=['Newest','Price: Low','Price: High','Name: A–Z'] as const;

export default function ProductsPage(){
  const [products,setProducts]=useState<Product[]>([]);
  const [q,setQ]=useState('');
  const [category,setCategory]=useState('All');
  const [sort,setSort]=useState<(typeof SORTS)[number]>('Newest');
  const [sizes,setSizes]=useState<string[]>([]);
  const [colors,setColors]=useState<string[]>([]);
  const [maxPrice,setMaxPrice]=useState(0);
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    setQ(params.get('search')||params.get('q')||'');
    setCategory(params.get('category')||'All');
    const incomingSort=params.get('sort')||'Newest';
    setSort(SORTS.includes(incomingSort as typeof SORTS[number])?incomingSort as typeof SORTS[number]:'Newest');
    setSizes((params.get('size')||'').split(',').filter(Boolean));
    setColors((params.get('color')||'').split(',').filter(Boolean));
    setMaxPrice(Number(params.get('maxPrice'))||0);
    fetch('/api/products').then(r=>{if(!r.ok)throw new Error();return r.json()}).then(data=>setProducts(Array.isArray(data)?data:[])).catch(()=>setError(true)).finally(()=>setLoading(false));
  },[]);

  const cats=useMemo(()=>['All',...Array.from(new Set(products.map(p=>p.category).filter(Boolean)))],[products]);
  const allSizes=useMemo(()=>Array.from(new Set(products.flatMap(p=>p.sizes||[]))).sort(),[products]);
  const allColors=useMemo(()=>Array.from(new Set(products.flatMap(p=>p.colors||[]))).sort(),[products]);
  const allLabels=useMemo(()=>Array.from(new Set(products.flatMap(p=>p.labels||[]))).filter(Boolean).slice(0,12),[products]);
  const highestPrice=useMemo(()=>Math.ceil(Math.max(...products.map(p=>p.price),1000)/500)*500,[products]);

  useEffect(()=>{
    const url=new URL(window.location.href);
    q?url.searchParams.set('search',q):url.searchParams.delete('search');
    category!=='All'?url.searchParams.set('category',category):url.searchParams.delete('category');
    sort!=='Newest'?url.searchParams.set('sort',sort):url.searchParams.delete('sort');
    sizes.length?url.searchParams.set('size',sizes.join(',')):url.searchParams.delete('size');
    colors.length?url.searchParams.set('color',colors.join(',')):url.searchParams.delete('color');
    maxPrice&&maxPrice<highestPrice?url.searchParams.set('maxPrice',String(maxPrice)):url.searchParams.delete('maxPrice');
    window.history.replaceState({},'',url.toString());
  },[q,category,sort,sizes,colors,maxPrice,highestPrice]);

  const filtered=useMemo(()=>{
    const needle=q.trim().toLowerCase();
    return products.filter(p=>{
      const haystack=[p.title,p.category,p.description,...(p.labels||[]),...(p.colors||[])].join(' ').toLowerCase();
      return (!needle||haystack.includes(needle))
        &&(category==='All'||p.category===category)
        &&(!sizes.length||sizes.some(size=>(p.sizes||[]).includes(size)))
        &&(!colors.length||colors.some(color=>(p.colors||[]).includes(color)))
        &&(!maxPrice||p.price<=maxPrice);
    }).sort((a,b)=>{
      if(sort==='Price: Low')return a.price-b.price;
      if(sort==='Price: High')return b.price-a.price;
      if(sort==='Name: A–Z')return a.title.localeCompare(b.title);
      return new Date(b.published||0).getTime()-new Date(a.published||0).getTime();
    });
  },[products,q,category,sort,sizes,colors,maxPrice]);

  const activeCount=(category!=='All'?1:0)+sizes.length+colors.length+(maxPrice&&maxPrice<highestPrice?1:0);
  function toggle(list:string[],value:string,setter:(next:string[])=>void){setter(list.includes(value)?list.filter(x=>x!==value):[...list,value])}
  function clearFilters(){setCategory('All');setSizes([]);setColors([]);setMaxPrice(0);setQ('');setSort('Newest')}

  return <main className="products-page">
    <section className="products-hero">
      <Image src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2200&q=90" alt="" fill priority sizes="100vw" quality={82}/>
      <div className="products-hero-overlay"/>
      <div className="products-hero-copy">
        <span className="eyebrow">THE FULL EDIT</span><h1>All Products</h1>
        <p>{q?'Showing results for "'+q+'".':category!=='All'?'Exploring the '+category+' edit.':'Discover our complete collection of premium clothing.'}</p>
      </div>
    </section>

    <section className="catalog">
      <div className="catalog-topline">
        <div><span className="catalog-count">{filtered.length} OF {products.length} PRODUCTS</span><h2>{q||activeCount?'Your edit':'Shop the collection'}</h2></div>
        <label className="catalog-search"><MagnifyingGlass size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clothes, categories..." aria-label="Search products"/>{q&&<button type="button" className="search-clear" onClick={()=>setQ('')} aria-label="Clear search"><X size={15}/></button>}</label>
      </div>

      <div className="mobile-search"><MagnifyingGlass size={17}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search clothes, categories..." aria-label="Search products"/>{q&&<button type="button" className="search-clear" onClick={()=>setQ('')} aria-label="Clear search"><X size={15}/></button>}</div>

      <div className="discovery-toolbar">
        <button className={filtersOpen?'filter-toggle active':'filter-toggle'} type="button" onClick={()=>setFiltersOpen(!filtersOpen)}><Funnel size={15}/> Filters {activeCount>0&&<span>{activeCount}</span>}</button>
        <div className="quick-labels">{allLabels.slice(0,5).map(label=><button key={label} type="button" className={q.toLowerCase()===label.toLowerCase()?'active':''} onClick={()=>setQ(label)}>{label}</button>)}</div>
        <label className="sort-control"><span>Sort by</span><select value={sort} onChange={e=>setSort(e.target.value as typeof SORTS[number])}>{SORTS.map(item=><option key={item}>{item}</option>)}</select><CaretDown size={14}/></label>
      </div>

      <div className={filtersOpen?'filter-panel open':'filter-panel'}>
        <div className="filter-group"><b>Category</b><div className="filter-options">{cats.map(c=><button key={c} type="button" className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
        {allSizes.length>0&&<div className="filter-group"><b>Size</b><div className="filter-options">{allSizes.map(size=><button key={size} type="button" className={sizes.includes(size)?'selected':''} onClick={()=>toggle(sizes,size,setSizes)}>{size}</button>)}</div></div>}
        {allColors.length>0&&<div className="filter-group"><b>Color</b><div className="filter-options">{allColors.map(color=><button key={color} type="button" className={colors.includes(color)?'selected':''} onClick={()=>toggle(colors,color,setColors)}>{color}</button>)}</div></div>}
        {highestPrice>0&&<div className="filter-group price-filter"><b>Maximum price <span>₹{(maxPrice||highestPrice).toLocaleString('en-IN')}</span></b><input type="range" min="0" max={highestPrice} step="100" value={maxPrice||highestPrice} onChange={e=>setMaxPrice(Number(e.target.value)===highestPrice?0:Number(e.target.value))}/><div><span>Any price</span><span>₹{highestPrice.toLocaleString('en-IN')}+</span></div></div>}
        {activeCount>0&&<button type="button" className="clear-filters" onClick={clearFilters}>Clear all filters</button>}
      </div>

      {error?<div className="empty error-inline"><p>We could not load the collection right now.</p><button className="drawer-link" onClick={()=>window.location.reload()}>Try again →</button></div>
      :loading?<div className="catalog-loading" aria-live="polite">Loading the collection…</div>
      :filtered.length?<div className="product-grid">{filtered.map(p=><ProductCard key={p.id} p={p}/>)}</div>
      :<div className="empty"><p>No products match this edit.</p><button className="drawer-link" onClick={clearFilters}>Reset discovery →</button></div>}
    </section>
  </main>;
}
