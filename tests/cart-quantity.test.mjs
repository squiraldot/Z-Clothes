import assert from 'node:assert/strict';
import test from 'node:test';
import { addQuantities } from '../lib/cart-quantity.ts';

test('adding a selected quantity to an existing variant preserves that quantity', () => {
  assert.equal(addQuantities(2, 5), 7);
});

test('adding a quantity never exceeds the cart maximum of 20', () => {
  assert.equal(addQuantities(18, 5), 20);
});
