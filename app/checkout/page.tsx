'use client';

import Link from 'next/link';
import { CheckCircle, Minus, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MAX_CART_QUANTITY,
  cartSubtotal,
  changeCartQuantity,
  removeCartItem,
  restoreCartItem,
} from '@/lib/cart-experience';
import { cartItemKey, readCart, writeCart, setCart, type CartItem } from '@/lib/shop';
import CheckoutAddressPicker from '@/components/CheckoutAddressPicker';

export default function Checkout() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orderError, setOrderError] = useState('');
  const [addressId, setAddressId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [undo, setUndo] = useState<{ item: CartItem; index: number } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(readCart());
    const handler = () => setItems(readCart());
    window.addEventListener('zclothes:cart-updated', handler);
    return () => window.removeEventListener('zclothes:cart-updated', handler);
  }, []);

  useEffect(() => () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, []);

  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  function save(next: CartItem[]) {
    setItems(next);
    writeCart(next);
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

  function change(item: CartItem, delta: number) {
    save(items.map((entry) => cartItemKey(entry) === cartItemKey(item)
      ? { ...entry, quantity: changeCartQuantity(entry.quantity, delta) }
      : entry));
  }

  async function applyCoupon() {
    if (!couponCode.trim() || couponLoading) return;
    setCouponLoading(true); setCouponError('');
    try {
      const response = await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode, subtotal }) });
      const data = await response.json();
      if (response.status === 401) { window.location.href = '/auth/login?next=/checkout'; return; }
      if (!response.ok) throw new Error(data.error || 'Unable to apply this coupon.');
      setAppliedCoupon({ code: data.coupon.coupon_code, discount: Number(data.coupon.discount_amount) });
      setCouponCode(data.coupon.coupon_code);
    } catch (error) {
      setAppliedCoupon(null);
      setCouponError(error instanceof Error ? error.message : 'Unable to apply this coupon.');
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponError('');
    setCouponCode('');
  }

  async function createOrder() {
    if (!items.length || creatingOrder) return;
    if (!addressId) { setOrderError('Please select a delivery address.'); return; }
    setCreatingOrder(true); setOrderError('');
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId, couponCode: appliedCoupon?.code || '', items: items.map(({ productId, quantity, color, size }) => ({ productId, quantity, color, size })) }),
      });
      const data = await response.json();
      if (response.status === 401) { window.location.href = '/auth/login?next=/checkout'; return; }
      if (!response.ok) throw new Error(data.error || 'Unable to create your order.');
      setOrderNumber(data.order.order_number);
      setOrderId(data.order.id);
      setCart([]);
      setItems([]);
      setShowSuccess(true);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Unable to create your order.');
    } finally {
      setCreatingOrder(false);
    }
  }

  return <main className="page checkout-page">
    <div className="page-hero">
      <span className="eyebrow">YOUR BAG</span>
      <h1>Review your pieces</h1>
      <p>Everything looks good? Payments will be enabled after verification.</p>
    </div>

    {!items.length ? (
      <div className="empty"><p>Your bag is empty.</p><Link className="btn dark" href="/products">Browse products →</Link></div>
    ) : (
      <div className="cart-layout">
        <div className="checkout-items-column">
          <CheckoutAddressPicker value={addressId} onChange={setAddressId} />
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-row" key={cartItemKey(item)}>
                <img src={item.image} alt="" />
                <div>
                  <h3>{item.title}</h3>
                  <p>₹{item.price.toLocaleString('en-IN')}</p>
                  {(item.color || item.size) && <div className="cart-variant">{[item.color, item.size].filter(Boolean).join(' · ')}</div>}
                  <div className="cart-qty">
                    <button onClick={() => change(item, -1)} aria-label={`Decrease quantity for ${item.title}`} disabled={item.quantity <= 1}><Minus size={12} /></button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button onClick={() => change(item, 1)} aria-label={`Increase quantity for ${item.title}`} disabled={item.quantity >= MAX_CART_QUANTITY}><Plus size={12} /></button>
                  </div>
                  {item.quantity >= MAX_CART_QUANTITY && <small className="cart-max-note">Maximum 20 per variant.</small>}
                  <button className="remove-item" onClick={() => remove(item)}><Trash size={12} /> Remove</button>
                </div>
                <strong>₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>
          {!!undo && (
            <div className="cart-undo checkout-undo" role="status">
              <span>{undo.item.title} removed.</span>
              <button onClick={restoreUndo}>Undo</button>
            </div>
          )}
        </div>

        <aside className="summary">
          <span className="eyebrow dark">ORDER SUMMARY</span>
          <div><span>Subtotal</span><b>₹{subtotal.toLocaleString('en-IN')}</b></div>
          <div className="coupon-box">
            <div className="coupon-row">
              <input value={couponCode} onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setCouponError(''); }} placeholder="Coupon code" maxLength={40} disabled={!!appliedCoupon} aria-label="Coupon code" />
              {appliedCoupon ? <button type="button" onClick={removeCoupon}>Remove</button> : <button type="button" onClick={applyCoupon} disabled={couponLoading}>{couponLoading ? 'Applying…' : 'Apply'}</button>}
            </div>
            {couponError && <p>{couponError}</p>}
            {appliedCoupon && <small>Coupon applied — you save ₹{discount.toLocaleString('en-IN')}.</small>}
          </div>
          {discount > 0 && <div className="summary-discount"><span>Coupon · {appliedCoupon?.code}</span><b>−₹{discount.toLocaleString('en-IN')}</b></div>}
          <div><span>Shipping</span><b>Free</b></div>
          <hr />
          <div className="summary-total"><span>Total</span><b>₹{total.toLocaleString('en-IN')}</b></div>
          <button className="dodo-btn" onClick={createOrder} disabled={creatingOrder}>{creatingOrder ? 'Creating order…' : 'Continue'} <span>→</span></button>
          {orderError && <p className="checkout-note">{orderError}</p>}
          <p className="checkout-note">Payment checkout is paused until verification. Your delivery address is saved securely with your order draft.</p>
        </aside>
      </div>
    )}

    {!!items.length && (
      <div className="mobile-checkout-bar">
        <div><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
        <button onClick={createOrder} disabled={creatingOrder}>{creatingOrder ? 'Creating…' : 'Continue'} <span>→</span></button>
      </div>
    )}

    {showSuccess && <div className="checkout-modal" role="dialog" aria-modal="true" onClick={() => setShowSuccess(false)}>
      <div className="checkout-modal-card" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={() => setShowSuccess(false)} aria-label="Close"><X size={20} /></button>
        <CheckCircle size={58} weight="fill" />
        <span className="eyebrow dark">Z-CLOTHES</span>
        <h2>Order draft saved</h2>
        <p>Your order draft <strong>{orderNumber}</strong> is saved to your account. Secure payments will be available after verification.</p>
        <div className="modal-actions"><Link className="btn dark" href={'/account/orders/' + orderId}>View order</Link><Link className="btn light" href="/products">Continue shopping</Link></div>
      </div>
    </div>}
  </main>;
}
