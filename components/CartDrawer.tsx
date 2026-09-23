'use client';

import { Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';

type CartItem = { productId:string; title:string; price:number; image:string; quantity:number; dodoProductId:string };

export function CartDrawer({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function load() {
    try { setItems(JSON.parse(localStorage.getItem('zclothes-cart') || '[]')); }
    catch { setItems([]); }
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('zclothes:cart-updated', handler);
    return () => window.removeEventListener('zclothes:cart-updated', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const total = useMemo(() => items.reduce((sum, x) => sum + x.price * x.quantity, 0), [items]);
  const count = items.reduce((sum, x) => sum + x.quantity, 0);

  function save(next:CartItem[]) {
    setItems(next);
    localStorage.setItem('zclothes-cart', JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('zclothes:cart-updated'));
  }

  function change(id:string, delta:number) {
    save(items.map(x => x.productId === id ? {...x, quantity:Math.max(1, x.quantity + delta)} : x));
  }

  function remove(id:string) { save(items.filter(x => x.productId !== id)); }

  return (
    <>
      <div className={open ? 'cart-backdrop open' : 'cart-backdrop'} onClick={onClose} />
      <aside className={open ? 'cart-drawer open' : 'cart-drawer'} aria-label="Shopping bag" aria-hidden={!open}>
        <div className="cart-drawer-head">
          <div><span className="eyebrow dark">YOUR BAG</span><h2>{count} {count === 1 ? 'piece' : 'pieces'}</h2></div>
          <button onClick={onClose} aria-label="Close bag"><X size={22}/></button>
        </div>

        <div className="cart-drawer-list">
          {!items.length ? (
            <div className="cart-empty">
              <span className="cart-empty-mark">Z</span>
              <h3>Your bag is empty</h3>
              <p>Add something you love and it will appear here.</p>
              <button className="drawer-link" onClick={onClose}>Continue shopping →</button>
            </div>
          ) : items.map(item => (
            <div className="drawer-item" key={item.productId}>
              <img src={item.image} alt="" />
              <div className="drawer-item-info">
                <div className="drawer-item-top"><h3>{item.title}</h3><button onClick={()=>remove(item.productId)} aria-label="Remove item"><Trash size={15}/></button></div>
                <p>₹{item.price.toLocaleString('en-IN')}</p>
                <div className="drawer-item-bottom">
                  <div className="qty"><button onClick={()=>change(item.productId,-1)} aria-label="Decrease"><Minus size={12}/></button><span>{item.quantity}</span><button onClick={()=>change(item.productId,1)} aria-label="Increase"><Plus size={12}/></button></div>
                  <strong>₹{(item.price*item.quantity).toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!!items.length && <div className="cart-drawer-foot">
          <div className="drawer-total"><span>Subtotal</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
          <p>Shipping calculated at checkout.</p>
          <a href="/checkout" className="drawer-checkout" onClick={onClose}>View bag & checkout <span>→</span></a>
        </div>}
      </aside>
    </>
  );
}
