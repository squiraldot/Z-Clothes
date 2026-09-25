'use client';

import Link from 'next/link';
import { MagnifyingGlass, UserCircle, ShoppingBag, Heart, List, X, ArrowRight } from '@phosphor-icons/react';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { CartDrawer } from '@/components/CartDrawer';
import { readCart, readWishlist } from '@/lib/shop';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { syncWishlist } from '@/lib/wishlist';
import { syncCart, syncCartToRemote } from '@/lib/cart-sync';

export function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [count, setCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [query, setQuery] = useState('');

  function syncCount() {
    setCount(readCart().reduce((sum, item) => sum + Number(item.quantity || 0), 0));
    setWishlistCount(readWishlist().length);
  }

  useEffect(() => {
    syncCount();
    const handler = () => syncCount();
    window.addEventListener('zclothes:cart-updated', handler);
    window.addEventListener('storage', handler);
    window.addEventListener('zclothes:wishlist-updated', handler);
    return () => {
      window.removeEventListener('zclothes:cart-updated', handler);
      window.removeEventListener('storage', handler);
      window.removeEventListener('zclothes:wishlist-updated', handler);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createSupabaseBrowserClient();

    supabase.auth.getUser().then(({ data }) => {
      if (active) {
        setAuthUser(data.user);
        if (data.user) syncWishlist().catch(() => undefined);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setAuthUser(session?.user ?? null);
        if (session?.user) syncWishlist().catch(() => undefined);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = searchOpen || accountOpen || bagOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen, accountOpen, bagOpen]);

  useEffect(() => {
    if (!(searchOpen || accountOpen || open)) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      if (searchOpen) setSearchOpen(false);
      if (accountOpen) setAccountOpen(false);
      if (open) setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen, accountOpen, open]);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    window.location.href = value ? `/products?search=${encodeURIComponent(value)}` : '/products';
    setSearchOpen(false);
  }

  function openAccount() {
    if (authUser) {
      router.push('/account');
      return;
    }
    setAccountOpen(true);
  }

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Z-Clothes home">
          <span className="brand-mark">Z</span><span className="brand-word">Z-CLOTHES</span>
        </Link>
        <nav id="primary-navigation" className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          <Link href="/" onClick={()=>setOpen(false)}>Home</Link>
          <Link href="/products" onClick={()=>setOpen(false)}>Shop</Link>
          <Link href="/about" onClick={()=>setOpen(false)}>About</Link>
          <Link href="/contact" onClick={()=>setOpen(false)}>Contact</Link>
          <Link href="/policies" onClick={()=>setOpen(false)}>Policies</Link>
        </nav>
        <div className="header-actions">
          <button aria-label="Search" onClick={()=>setSearchOpen(true)}><MagnifyingGlass size={20}/></button>
          <button aria-label={authUser ? 'Open account' : 'Sign in'} onClick={openAccount}>
            <UserCircle size={21}/>
          </button>
          <Link href="/wishlist" aria-label="Wishlist">
            <Heart size={20} weight={wishlistCount ? 'fill' : 'regular'}/>
            {wishlistCount > 0 && <span className="cart-dot">{wishlistCount > 99 ? '99+' : wishlistCount}</span>}
          </Link>
          <button className="bag-button" onClick={()=>setBagOpen(true)} aria-label={`Shopping bag, ${count} items`}>
            <ShoppingBag size={20}/>
            {count > 0 && <span className="cart-dot">{count > 99 ? '99+' : count}</span>}
          </button>
          <button className="menu-btn" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={22}/> : <List size={22}/>}
          </button>
        </div>
      </header>

      <CartDrawer open={bagOpen} onClose={()=>setBagOpen(false)} />

      {searchOpen && (
        <div className="header-modal" role="dialog" aria-modal="true" aria-labelledby="search-title">
          <button className="header-modal-close" onClick={()=>setSearchOpen(false)} aria-label="Close search"><X size={24}/></button>
          <form className="header-search-form" onSubmit={submitSearch}>
            <span id="search-title" className="eyebrow dark">SEARCH Z-CLOTHES</span>
            <div className="header-search-field">
              <MagnifyingGlass size={25}/>
              <input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search tees, hoodies, jackets..." />
              <button type="submit" aria-label="Submit search"><ArrowRight size={22}/></button>
            </div>
            <div className="search-suggestions">
              {['T-Shirts','Hoodies','Jackets','Cargo Pants'].map((term)=>
                <button key={term} type="button" onClick={() => { setQuery(term); window.location.href = `/products?search=${encodeURIComponent(term)}`; }}>
                  {term}
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {accountOpen && (
        <div className="header-modal" role="dialog" aria-modal="true" aria-labelledby="account-title">
          <button className="header-modal-close" onClick={()=>setAccountOpen(false)} aria-label="Close account"><X size={24}/></button>
          <div className="account-modal-card">
            <span id="account-title" className="eyebrow dark">Z-CLOTHES ACCOUNT</span>
            <h2>Make the edit yours.</h2>
            <p>Sign in to save your profile and keep your Z-Clothes journey connected across devices.</p>
            <div className="modal-actions">
              <Link className="btn dark" href="/auth/login" onClick={()=>setAccountOpen(false)}>Sign in</Link>
              <Link className="btn light" href="/auth/signup" onClick={()=>setAccountOpen(false)}>Create account</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
