'use client';

import Image from 'next/image';
import { Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MAX_CART_QUANTITY,
  cartItemCount,
  cartSubtotal,
  changeCartQuantity,
  removeCartItem,
  restoreCartItem,
} from '@/lib/cart-experience';
import { cartItemKey, readCart, writeCart, type CartItem } from '@/lib/shop';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [undo, setUndo] = useState<{ item: CartItem; index: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readCart());
    const handler = () => setItems(readCart());
    window.addEventListener('zclothes:cart-updated', handler);
    return () => window.removeEventListener('zclothes:cart-updated', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);

  const total = useMemo(() => cartSubtotal(items), [items]);
  const count = useMemo(() => cartItemCount(items), [items]);

  function save(next: CartItem[]) {
    setItems(next);
    writeCart(next);
  }

  function change(item: CartItem, delta: number) {
    save(items.map((entry) => cartItemKey(entry) === cartItemKey(item)
      ? { ...entry, quantity: changeCartQuantity(entry.quantity, delta) }
      : entry));
  }

  function remove(item: CartItem) {
    const result = removeCartItem(items, item);
    if (!result.removed) return;
    save(result.items);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndo({ item: result.removed, index: result.index });
    undoTimerRef.current = setTimeout(() => setUndo(null), 5000);
  }

  function restoreUndo() {
    if (!undo) return;
    save(restoreCartItem(items, undo.item, undo.index));
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndo(null);
  }

  function clearBag() {
    save([]);
    setConfirmClear(false);
    setUndo(null);
  }

  return <>
    <div className={open ? 'cart-backdrop open' : 'cart-backdrop'} onClick={onClose} />
    <aside
      className={open ? 'cart-drawer open' : 'cart-drawer'}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
      aria-hidden={!open}
    >
      <div className="cart-drawer-head">
        <div>
          <span className="eyebrow dark">YOUR BAG</span>
          <h2>{count} {count === 1 ? 'piece' : 'pieces'}</h2>
        </div>
        <div className="cart-head-actions">
          {!!items.length && !confirmClear && (
            <button className="cart-clear" onClick={() => setConfirmClear(true)}>Clear</button>
          )}
          {confirmClear && (
            <div className="cart-clear-confirm" role="alert">
              <span>Clear all?</span>
              <button onClick={clearBag}>Yes</button>
              <button onClick={() => setConfirmClear(false)}>No</button>
            </div>
          )}
          <button ref={closeRef} onClick={onClose} aria-label="Close bag"><X size={22} /></button>
        </div>
      </div>

      <div className="cart-drawer-list">
        {!items.length ? (
          <div className="cart-empty">
            <span className="cart-empty-mark">Z</span>
            <h3>Your bag is empty</h3>
            <p>Add something you love and it will appear here.</p>
            <button className="drawer-link" onClick={onClose}>Continue shopping →</button>
          </div>
        ) : items.map((item) => (
          <div className="drawer-item" key={cartItemKey(item)}>
            <div className="drawer-item-image"><Image src={item.image} alt="" fill sizes="92px" /></div>
            <div className="drawer-item-info">
              <div className="drawer-item-top">
                <h3>{item.title}</h3>
                <button onClick={() => remove(item)} aria-label={`Remove ${item.title}`}><Trash size={15} /></button>
              </div>
              <p>₹{item.price.toLocaleString('en-IN')}</p>
              {(item.color || item.size) && <div className="drawer-variant">{[item.color, item.size].filter(Boolean).join(' · ')}</div>}
              <div className="drawer-item-bottom">
                <div className="qty">
                  <button onClick={() => change(item, -1)} aria-label={`Decrease quantity for ${item.title}`} disabled={item.quantity <= 1}><Minus size={12} /></button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button onClick={() => change(item, 1)} aria-label={`Increase quantity for ${item.title}`} disabled={item.quantity >= MAX_CART_QUANTITY}><Plus size={12} /></button>
                </div>
                <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
              </div>
              {item.quantity >= MAX_CART_QUANTITY && <small className="cart-max-note">Maximum 20 per variant.</small>}
            </div>
          </div>
        ))}
      </div>

      {!!undo && (
        <div className="cart-undo" role="status">
          <span>{undo.item.title} removed.</span>
          <button onClick={restoreUndo}>Undo</button>
        </div>
      )}

      {!!items.length && (
        <div className="cart-drawer-foot">
          <div className="drawer-total"><span>Subtotal · {count} {count === 1 ? 'piece' : 'pieces'}</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
          <p>Shipping calculated at checkout.</p>
          <a href="/checkout" className="drawer-checkout" onClick={onClose}>View bag & checkout <span>→</span></a>
        </div>
      )}
    </aside>
  </>;
}
