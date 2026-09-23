'use client';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { LockKey } from '@phosphor-icons/react';

type CartItem = { productId:string; title:string; price:number; image:string; quantity:number; dodoProductId:string };

function addItem(product:Product){
  const current:CartItem[] = JSON.parse(localStorage.getItem('zclothes-cart') || '[]');
  const existing=current.find(x=>x.productId===product.id);
  if(existing) existing.quantity += 1; else current.push({productId:product.id,title:product.title,price:product.price,image:product.image,quantity:1,dodoProductId:product.dodoProductId || ''});
  localStorage.setItem('zclothes-cart',JSON.stringify(current));
}

export function BuyButton({product}:{product:Product}){
  const [busy,setBusy]=useState(false);
  function add(){ addItem(product); window.location.href='/checkout'; }
  async function buy(){
    if(!product.dodoProductId){alert('This product is not connected to a Dodo product yet. Add data-dodo-product-id to the Blogger post.');return}
    setBusy(true);
    const r=await fetch('/api/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items:[{productId:product.dodoProductId,quantity:1}]})});
    const d=await r.json(); setBusy(false);
    if(d.checkout_url) window.location.href=d.checkout_url; else alert(d.error||'Checkout could not be created.');
  }
  return <div className="buy-stack"><button className="add-cart" onClick={add}>Add to Cart</button><button className="dodo-btn" onClick={buy} disabled={busy}><LockKey size={18}/>{busy?'Opening checkout…':'Buy with Dodo'}</button></div>
}
