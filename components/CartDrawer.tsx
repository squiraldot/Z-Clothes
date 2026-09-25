'use client';

import Image from 'next/image';
import { Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { cartItemKey, readCart, writeCart, type CartItem } from '@/lib/shop';

export function CartDrawer({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => { setItems(readCart()); const handler=()=>setItems(readCart()); window.addEventListener('zclothes:cart-updated',handler); return()=>window.removeEventListener('zclothes:cart-updated',handler); }, []);
  useEffect(() => { document.body.style.overflow=open?'hidden':''; return()=>{document.body.style.overflow=''}; }, [open]);
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const total=useMemo(()=>items.reduce((sum,x)=>sum+x.price*x.quantity,0),[items]);
  const count=items.reduce((sum,x)=>sum+x.quantity,0);
  function save(next:CartItem[]){setItems(next);writeCart(next)}
  function change(item:CartItem,delta:number){save(items.map(x=>cartItemKey(x)===cartItemKey(item)?{...x,quantity:Math.max(1,x.quantity+delta)}:x))}
  function remove(item:CartItem){save(items.filter(x=>cartItemKey(x)!==cartItemKey(item)))}
  function clearBag(){save([])}

  return <>
    <div className={open?'cart-backdrop open':'cart-backdrop'} onClick={onClose}/>
    <aside className={open?'cart-drawer open':'cart-drawer'} aria-label="Shopping bag" aria-hidden={!open}>
      <div className="cart-drawer-head"><div><span className="eyebrow dark">YOUR BAG</span><h2>{count} {count===1?'piece':'pieces'}</h2></div><div className="cart-head-actions">{!!items.length&&<button className="cart-clear" onClick={clearBag}>Clear</button>}<button onClick={onClose} aria-label="Close bag"><X size={22}/></button></div></div>
      <div className="cart-drawer-list">{!items.length?<div className="cart-empty"><span className="cart-empty-mark">Z</span><h3>Your bag is empty</h3><p>Add something you love and it will appear here.</p><button className="drawer-link" onClick={onClose}>Continue shopping →</button></div>:items.map(item=><div className="drawer-item" key={cartItemKey(item)}>
        <div className="drawer-item-image"><Image src={item.image} alt="" fill sizes="92px"/></div>
        <div className="drawer-item-info"><div className="drawer-item-top"><h3>{item.title}</h3><button onClick={()=>remove(item)} aria-label={`Remove ${item.title}`}><Trash size={15}/></button></div><p>₹{item.price.toLocaleString('en-IN')}</p>{(item.color||item.size)&&<div className="drawer-variant">{[item.color,item.size].filter(Boolean).join(' · ')}</div>}<div className="drawer-item-bottom"><div className="qty"><button onClick={()=>change(item,-1)} aria-label="Decrease"><Minus size={12}/></button><span>{item.quantity}</span><button onClick={()=>change(item,1)} aria-label="Increase"><Plus size={12}/></button></div><strong>₹{(item.price*item.quantity).toLocaleString('en-IN')}</strong></div></div>
      </div>)}</div>
      {!!items.length&&<div className="cart-drawer-foot"><div className="drawer-total"><span>Subtotal</span><strong>₹{total.toLocaleString('en-IN')}</strong></div><p>Shipping calculated at checkout.</p><a href="/checkout" className="drawer-checkout" onClick={onClose}>View bag & checkout <span>→</span></a></div>}
    </aside>
  </>;
}
