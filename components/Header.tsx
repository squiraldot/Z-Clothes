'use client';

import Link from 'next/link';
import { MagnifyingGlass, UserCircle, ShoppingBag, List, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { CartDrawer } from '@/components/CartDrawer';

export function Header() {
  const [open, setOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [count, setCount] = useState(0);

  function syncCount() {
    try {
      const items = JSON.parse(localStorage.getItem('zclothes-cart') || '[]');
      setCount(items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0));
    } catch { setCount(0); }
  }

  useEffect(() => {
    syncCount();
    const handler = () => syncCount();
    window.addEventListener('zclothes:cart-updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('zclothes:cart-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

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
          <button aria-label="Search"><MagnifyingGlass size={20}/></button>
          <button aria-label="Account"><UserCircle size={21}/></button>
          <button className="bag-button" onClick={()=>setBagOpen(true)} aria-label={`Shopping bag, ${count} items`}>
            <ShoppingBag size={20}/>{count>0&&<span className="cart-dot">{count>99?'99+':count}</span>}
          </button>
          <button className="menu-btn" onClick={()=>setOpen(!open)} aria-label={open?'Close menu':'Open menu'}>{open?<X size={22}/>:<List size={22}/>}</button>
        </div>
      </header>
      <CartDrawer open={bagOpen} onClose={()=>setBagOpen(false)} />
    </>
  );
}
