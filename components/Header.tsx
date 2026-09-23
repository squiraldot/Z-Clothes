'use client';

import Link from 'next/link';
import { MagnifyingGlass, UserCircle, ShoppingBag, List, X } from '@phosphor-icons/react';
import { useState } from 'react';

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Z-Clothes home">
        <span className="brand-mark">Z</span>
        <span className="brand-word">Z-CLOTHES</span>
      </Link>

      <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
        <Link href="/" onClick={() => setOpen(false)}>Home</Link>
        <Link href="/products" onClick={() => setOpen(false)}>Shop</Link>
        <Link href="/about" onClick={() => setOpen(false)}>About</Link>
        <Link href="/contact" onClick={() => setOpen(false)}>Contact</Link>
        <Link href="/policies" onClick={() => setOpen(false)}>Policies</Link>
      </nav>

      <div className="header-actions">
        <button aria-label="Search"><MagnifyingGlass size={20} /></button>
        <button aria-label="Account"><UserCircle size={21} /></button>
        <Link href="/checkout" aria-label="Shopping bag">
          <ShoppingBag size={20} />
          <span className="cart-dot">0</span>
        </Link>
        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>
    </header>
  );
}
