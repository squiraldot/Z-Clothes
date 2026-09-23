'use client';
import Link from 'next/link'; import { useEffect, useMemo, useState } from 'react';

type CartItem={productId:string;title:string;price:number;image:string;quantity:number;dodoProductId:string};
export default function Checkout(){
 const [items,setItems]=useState<CartItem[]>([]); const [busy,setBusy]=useState(false);
 useEffect(()=>{try{setItems(JSON.parse(localStorage.getItem('zclothes-cart')||'[]'))}catch{setItems([])}},[]);
 const total=useMemo(()=>items.reduce((s,x)=>s+x.price*x.quantity,0),[items]);
 function remove(id:string){const next=items.filter(x=>x.productId!==id);setItems(next);localStorage.setItem('zclothes-cart',JSON.stringify(next));}
 async function pay(){
  if(!items.length)return; if(items.some(x=>!x.dodoProductId)){alert('One or more products are missing their Dodo product ID.');return}
  setBusy(true); const r=await fetch('/api/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items:items.map(x=>({productId:x.dodoProductId,quantity:x.quantity}))})}); const d=await r.json(); setBusy(false); if(d.checkout_url)window.location.href=d.checkout_url;else alert(d.error||'Checkout failed.');
 }
 return <main className="page checkout-page"><div className="page-hero"><span className="eyebrow">SECURE CHECKOUT</span><h1>Your cart</h1><p>Review your pieces, then continue to Dodo Payments.</p></div>{!items.length?<div className="empty"><p>Your cart is empty.</p><Link className="btn dark" href="/products">Browse products →</Link></div>:<div className="cart-layout"><div className="cart-list">{items.map(x=><div className="cart-row" key={x.productId}><img src={x.image} alt=""/><div><h3>{x.title}</h3><p>Qty {x.quantity}</p><button onClick={()=>remove(x.productId)}>Remove</button></div><strong>₹{(x.price*x.quantity).toLocaleString('en-IN')}</strong></div>)}</div><aside className="summary"><span className="eyebrow dark">ORDER SUMMARY</span><div><span>Subtotal</span><b>₹{total.toLocaleString('en-IN')}</b></div><div><span>Shipping</span><b>Calculated by Dodo</b></div><hr/><div className="summary-total"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div><button className="dodo-btn" onClick={pay} disabled={busy}>{busy?'Opening checkout…':'Pay securely with Dodo'}</button></aside></div>}</main>
}
