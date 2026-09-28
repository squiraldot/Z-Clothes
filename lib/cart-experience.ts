import type { CartItem } from './shop';

function cartItemKey(item: Pick<CartItem, 'productId' | 'color' | 'size'>) {
  return [item.productId, item.color || '', item.size || ''].join('::');
}

export const MAX_CART_QUANTITY = 20;

export function cartRevisionChanged(startRevision: number, currentRevision: number) {
  return startRevision !== currentRevision;
}

export function canCommitCartSync(startRevision: number, currentRevision: number) {
  return !cartRevisionChanged(startRevision, currentRevision);
}

export function changeCartQuantity(quantity: number, delta: number) {
  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.floor(quantity) + Math.trunc(delta)));
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function removeCartItem(items: CartItem[], item: CartItem) {
  const index = items.findIndex((entry) => cartItemKey(entry) === cartItemKey(item));
  if (index < 0) return { items, removed: null, index: -1 } as const;
  return {
    items: items.filter((_, entryIndex) => entryIndex !== index),
    removed: items[index],
    index,
  } as const;
}

export function restoreCartItem(items: CartItem[], item: CartItem, index: number) {
  const next = [...items];
  const existingIndex = next.findIndex((entry) => cartItemKey(entry) === cartItemKey(item));
  if (existingIndex >= 0) next[existingIndex] = item;
  else next.splice(Math.max(0, Math.min(index, next.length)), 0, item);
  return next;
}
