import type { Product } from '@/lib/types';

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  color?: string;
  size?: string;
  dodoProductId?: string;
};

export const CART_KEY = 'zclothes-cart';
export const WISHLIST_KEY = 'zclothes-wishlist';

export function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('zclothes:cart-updated'));
}

export function setCart(items: CartItem[]) {
  writeCart(items);
}

export function cartItemKey(item: Pick<CartItem, 'productId' | 'color' | 'size'>) {
  return [item.productId, item.color || '', item.size || ''].join('::');
}

export function addToCart(product: Product, options?: { color?: string; size?: string; quantity?: number }) {
  const current = readCart();
  const nextItem: CartItem = {
    productId: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    quantity: Math.max(1, Math.min(20, Math.floor(options?.quantity || 1))),
    color: options?.color || product.colors?.[0] || '',
    size: options?.size || product.sizes?.[0] || '',
    dodoProductId: product.dodoProductId || '',
  };
  const key = cartItemKey(nextItem);
  const existing = current.find((item) => cartItemKey(item) === key);
  if (existing) existing.quantity += 1;
  else current.push(nextItem);
  writeCart(current);
}

export function readWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    return Array.isArray(value) ? value.map(String) : [];
  } catch {
    return [];
  }
}

export function toggleWishlist(productId: string) {
  const current = readWishlist();
  const next = current.includes(productId)
    ? current.filter((id) => id !== productId)
    : [...current, productId];
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('zclothes:wishlist-updated'));
  return next;
}


export function setWishlist(items: string[]) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify([...new Set(items)]));
  window.dispatchEvent(new CustomEvent('zclothes:wishlist-updated'));
}
