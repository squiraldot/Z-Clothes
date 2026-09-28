import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_CART_QUANTITY,
  cartItemCount,
  cartSubtotal,
  changeCartQuantity,
  removeCartItem,
  restoreCartItem,
  cartRevisionChanged,
} from '../lib/cart-experience.ts';

const item = (productId, quantity, price = 100) => ({
  productId,
  title: productId,
  price,
  image: '/image.jpg',
  quantity,
  color: 'Black',
  size: 'M',
});

test('cart quantity increments without exceeding the maximum', () => {
  assert.equal(changeCartQuantity(19, 1), 20);
  assert.equal(changeCartQuantity(20, 1), MAX_CART_QUANTITY);
});

test('cart quantity decrements without dropping below one', () => {
  assert.equal(changeCartQuantity(2, -1), 1);
  assert.equal(changeCartQuantity(1, -1), 1);
});

test('cart item count sums quantities across variants', () => {
  assert.equal(cartItemCount([item('a', 2), item('b', 3)]), 5);
});

test('cart subtotal sums each line using its current quantity', () => {
  assert.equal(cartSubtotal([item('a', 2, 250), item('b', 3, 100)]), 800);
});

test('removing a cart item returns its original index for undo', () => {
  const items = [item('a', 1), item('b', 2), item('c', 1)];
  const result = removeCartItem(items, items[1]);
  assert.deepEqual(result.items.map((x) => x.productId), ['a', 'c']);
  assert.equal(result.removed.productId, 'b');
  assert.equal(result.index, 1);
});

test('restoring an undone cart item returns it to its original position', () => {
  const items = [item('a', 1), item('c', 1)];
  const removed = item('b', 2);
  const restored = restoreCartItem(items, removed, 1);
  assert.deepEqual(restored.map((x) => x.productId), ['a', 'b', 'c']);
});

test('restoring an item with an invalid index appends it safely', () => {
  const items = [item('a', 1)];
  const removed = item('b', 1);
  const restored = restoreCartItem(items, removed, 99);
  assert.deepEqual(restored.map((x) => x.productId), ['a', 'b']);
});

test('cart revision guard detects a local mutation during remote sync', () => {
  assert.equal(cartRevisionChanged(4, 5), true);
  assert.equal(cartRevisionChanged(4, 4), false);
});
