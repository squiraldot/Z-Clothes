'use client';

import Link from 'next/link';
import { CheckCircle, Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { cartItemKey, readCart, writeCart, type CartItem } from '@/lib/shop';

export default function CheckoutClient(){
 const [items,setItems]=useState<CartItem[]>([]);
 const [showSuccess,setShowSuccess]=useState(false);
 useEffect(()=>{setItems(readCart());const handler=()=>setItems(readCart());window.addEventListener('zclothes:cart-updated',handler);return()=>window.removeEventListener('zclothes:cart-updated',handler)},[]);
 const total=useMemo(()=>items.reduce((s,x)=>s+x.price*x.quantity,0),[items]);
 function save(next:CartItem[]){setItems(next);writeCart(next)}
 function remove(item:CartItem){save(items.filter(x=>cartItemKey(x)!==cartItemKey(item)))}
 function change(item:CartItem,delta:number){save(items.map(x=>cartItemKey(x)===cartItemKey(item)?{...x,quantity:Math.max(1,x.quantity+delta)}:x))}
 return <main className="page checkout-page">
  <div className="page-hero"><span className="eyebrow">YOUR BAG</span><h1>Review your pieces</h1><p>Everything looks good? Payments will be enabled after verification.</p></div>
  {!items.length?<div className="empty"><p>Your bag is empty.</p><Link className="btn dark" href="/products">Browse products →</Link></div>:<div className="cart-layout">
   <div className="cart-list">{items.map(x=><div className="cart-row" key={cartItemKey(x)}><img src={x.image} alt=""/><div><h3>{x.title}</h3><p>₹{x.price.toLocaleString('en-IN')}</p>{(x.color||x.size)&&<div className="cart-variant">{[x.color,x.size].filter(Boolean).join(' · ')}</div>}<div className="cart-qty"><button onClick={()=>change(x,-1)} aria-label="Decrease"><Minus size={12}/></button><span>{x.quantity}</span><button onClick={()=>change(x,1)} aria-label="Increase"><Plus size={12}/></button></div><button className="remove-item" onClick={()=>remove(x)}><Trash size={12}/> Remove</button></div><strong>₹{(x.price*x.quantity).toLocaleString('en-IN')}</strong></div>)}</div>
   <aside className="summary"><span className="eyebrow dark">ORDER SUMMARY</span><div><span>Subtotal</span><b>₹{total.toLocaleString('en-IN')}</b></div><div><span>Shipping</span><b>Free</b></div><hr/><div className="summary-total"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div><button className="dodo-btn" onClick={()=>setShowSuccess(true)}>Continue <span>→</span></button><p className="checkout-note">Payment checkout is currently paused. No payment is collected in this preview.</p></aside>
  </div>}
  {showSuccess&&<div className="checkout-modal" role="dialog" aria-modal="true" onClick={()=>setShowSuccess(false)}><div className="checkout-modal-card" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowSuccess(false)} aria-label="Close"><X size={20}/></button><CheckCircle size={58} weight="fill"/><span className="eyebrow dark">Z-CLOTHES</span><h2>Congratulations 🎉</h2><p>Your bag is saved. Secure payments will be available after verification.</p><button className="btn dark" onClick={()=>setShowSuccess(false)}>Continue shopping</button></div></div>}
 </main>
}