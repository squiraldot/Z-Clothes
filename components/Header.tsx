'use client';

import Link from 'next/link';
import { MagnifyingGlass, UserCircle, ShoppingBag, Heart, List, X, ArrowRight } from '@phosphor-icons/react';
import { useEffect, useState, type FormEvent } from 'react';
import { CartDrawer } from '@/components/CartDrawer';
import { readCart, readWishlist } from '@/lib/shop';

export function Header() {
  const [open, setOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [count, setCount] = useState(0);\n  const [wishlistCount, setWishlistCount] = useState(0);
  const [query, setQuery] = useState('');

  function syncCount() {
    setCount(readCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0));\n    setWishlistCount(readWishlist().length);
  }

  useEffect(() => {
    syncCount();
    const handler = () => syncCount();
    window.addEventListener('zclothes:cart-updated', handler);
    window.addEventListener('storage', handler);\n    window.addEventListener('zclothes:wishlist-updated', handler);
    return () => {
      window.removeEventListener('zclothes:cart-updated', handler);
      window.removeEventListener('storage', handler);\n      window.removeEventListener('zclothes:wishlist-updated', handler);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen || accountOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen, accountOpen]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    window.location.href = value ? `/products?search=${encodeURIComponent(value)}` : '/products';
    setSearchOpen(false);
  }

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Z-Clothes home">
          <span className="brand-mark">Z</span><span className="brand-word">Z-CLOTHES</span>
        </Link>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          <Link href="/" onClick={()=>setOpen(false)}>Home</Link>
          <Link href="/products" onClick={()=>setOpen(false)}>Shop</Link>
          <Link href="/about" onClick={()=>setOpen(false)}>About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)}>Contact</Link>
          <Link href="/policies" onClick={()=>setOpen(false)}>Policies</Link>
        </nav>
        <div className="header-actions">
          <button aria-label="Search" onClick={()=>setSearchOpen(true)}><MagnifyingGlass size={20}/></button>
          <button aria-label="Account" onClick={()=>setAccountOpen(true)}><UserCircle size={21}/></button>\n          <Link href="/wishlist" aria-label="Wishlist"><Heart size={20} weight={wishlistCount ? 'fill' : 'regular'}/>{wishlistCount>0&&<span className="cart-dot">{wishlistCount>99?'99+':wishlistCount}</span>}</Link>
          <button className="bag-button" onClick={()=>setBagOpen(true)} aria-label={`Shopping bag, ${count} items`}>
            <ShoppingBag size={20}/>{count>0&&<span className="cart-dot">{count>99?'99+':count}</span>}
          </button>
          <button className="menu-btn" onClick={()=>setOpen(!open)} aria-label={open?'Close menu':'Open menu'}>{open?<X size={22}/>:<List size={22}/>}</button>
        </div>
      </header>

      <CartDrawer open={bagOpen} onClose={()=>setBagOpen(false)} />

      {searchOpen && (
        <div className="header-modal" role="dialog" aria-modal="true" aria-label="Search Z-Clothes">
          <button className="header-modal-close" onClick={()=>setSearchOpen(false)} aria-label="Close search"><X size={24}/></button>
          <form className="header-search-form" onSubmit={submitSearch}>
            <span className="eyebrow dark">SEARCH Z-CLOTHES</span>
            <div className="header-search-field">
              <MagnifyingGlass size={25}/>
              <input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search tees, hoodies, jackets..." />
              <button type="submit" aria-label="Submit search"><ArrowRight size={22}/></button>
            </div>
            <div className="search-suggestions">
              {['T-Shirts','Hoodies','Jackets','Cargo Pants'].map((term)=><button key={term} type="button" onClick={()=>{setQuery(term);window.location.href=`/products?search=${encodeURIComponent(term)}`}}>{term}</button>)}
            </div>
          </form>
        </div>
      )}

      {accountOpen && (
        <div className="header-modal" role="dialog" aria-modal="true" aria-label="Account">
          <button className="header-modal-close" onClick={()=>setAccountOpen(false)} aria-label="Close account"><X size={24}/></button>
          <div className="account-modal-card">
            <span className="eyebrow dark">Z-CLOTHES ACCOUNT</span>
            <h2>Your account is coming soon.</h2>
            <p>For now, keep your bag saved in this browser and shop without signing in.</p>
            <button className="btn dark" onClick={()=>setAccountOpen(false)}>Continue shopping</button>
          </div>
        </div>
      )}
    </>
  );
}
