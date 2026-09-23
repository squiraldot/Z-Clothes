'use client';
import Link from 'next/link';
import { MagnifyingGlass, UserCircle, ShoppingBag, List, X } from '@phosphor-icons/react';
import { useState } from 'react';
export function Header(){ const [open,setOpen]=useState(false); return <header className="site-header"><Link href="/" className="brand">Z-CLOTHES</Link><nav className={open?'nav open':'nav'}><Link href="/">Home</Link><Link href="/products">All Products</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><Link href="/policies">Policies</Link></nav><div className="header-actions"><button aria-label="Search"><MagnifyingGlass size={20}/></button><button aria-label="Account"><UserCircle size={21}/></button><Link href="/checkout" aria-label="Cart"><ShoppingBag size={20}/><span className="cart-dot">0</span></Link><button className="menu-btn" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X size={22}/>:<List size={22}/>}</button></div></header> }
