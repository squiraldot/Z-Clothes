'use client';

import Link from 'next/link';
import { CheckCircle, Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { cartItemKey, readCart, writeCart, type CartItem } from '@/lib/shop';

export default function Checkout(){
 const [items,setItems]=useState<CartItem[]>([]);
 const [showSuccess,setShowSuccess]=useState(false);
 const [creatingOrder,setCreatingOrder]=useState(false);
 const [orderNumber,setOrderNumber]=useState('');
 const [orderError,setOrderError]=useState('');

 useEffect(()=>{
   setItems(readCart());
   const handler=()=>setItems(readCart());
   window.addEventListener('zclothes:cart-updated',handler);
   return()=>window.removeEventListener('zclothes:cart-updated',handler);
 },[]);

 const total=useMemo(()=>items.reduce((s,x)=>s+x.price*x.quantity,0),[items]);

 function save(next:CartItem[]){setItems(next);writeCart(next)}
 function remove(item:CartItem){save(items.filter(x=>cartItemKey(x)!==cartItemKey(item)))}
 function change(item:CartItem,delta:number){save(items.map(x=>cartItemKey(x)===cartItemKey(item)?{...x,quantity:Math.max(1,x.quantity+delta)}:x))}

 async function createOrder(){
  if(!items.length || creatingOrder) return;
  setCreatingOrder(true); setOrderError('');
  try {
   const response=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
   const data=await response.json();
   if(response.status===401){window.location.href='/auth/login?next=/checkout';return;}
   if(!response.ok) throw new Error(data.error||'Unable to create your order.');
   setOrderNumber(data.order.order_number);
   setShowSuccess(true);
  } catch(error) { setOrderError(error instanceof Error ? error.message : 'Unable to create your order.'); }
  finally { setCreatingOrder(false); }
 }

 return <main className="page checkout-page">
  <div className="page-hero"><span className="eyebrow">YOUR BAG</span><h1>Review your pieces</h1><p>Everything looks good? Payments will be enabled after verification.</p></div>
  {!items.length?<div className="empty"><p>Your bag is empty.</p><Link className="btn dark" href="/products">Browse products →</Link></div>:<div className="cart-layout">
   <div className="cart-list">{items.map(x=><div className="cart-row" key={cartItemKey(x)}><img src={x.image} alt=""/><div><h3>{x.title}</h3><p>₹{x.price.toLocaleString('en-IN')}</p>{(x.color||x.size)&&<div className="cart-variant">{[x.color,x.size].filter(Boolean).join(' · ')}</div>}<div className="cart-qty"><button onClick={()=>change(x,-1)} aria-label="Decrease"><Minus size={12}/></button><span>{x.quantity}</span><button onClick={()=>change(x,1)} aria-label="Increase"><Plus size={12}/></button></div><button className="remove-item" onClick={()=>remove(x)}><Trash size={12}/> Remove</button></div><strong>₹{(x.price*x.quantity).toLocaleString('en-IN')}</strong></div>)}</div>
   <aside className="summary"><span className="eyebrow dark">ORDER SUMMARY</span><div><span>Subtotal</span><b>₹{total.toLocaleString('en-IN')}</b></div><div><span>Shipping</span><b>Free</b></div><hr/><div className="summary-total"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div><button className="dodo-btn" onClick={createOrder} disabled={creatingOrder}>{creatingOrder ? 'Creating order…' : 'Continue'} <span>→</span></button>
   {orderError&&<p className="checkout-note">{orderError}</p>}<p className="checkout-note">Payment checkout is coming soon. Your cart is saved safely in this browser.</p></aside>
  </div>}
  {showSuccess&&<div className="checkout-modal" role="dialog" aria-modal="true" onClick={()=>setShowSuccess(false)}><div className="checkout-modal-card" onClick={e=>e.stopPropagation()}><button className="modal-close" onClick={()=>setShowSuccess(false)} aria-label="Close"><X size={20}/></button><CheckCircle size={58} weight="fill"/><span className="eyebrow dark">Z-CLOTHES</span><h2>Congratulations 🎉</h2><p>Your order draft <strong>{orderNumber}</strong> is saved to your account. Secure payments will be available after verification.</p><button className="btn dark" onClick={()=>setShowSuccess(false)}>Continue shopping</button></div></div>}
 </main>
}
