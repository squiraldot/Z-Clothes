import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearchQuery, searchProducts, getSearchSuggestions, getSearchTokens } from '../lib/smart-search.ts';

const products = [
  { id:'1', title:'Oversized Black Hoodie', description:'Heavy cotton layer', category:'Hoodies', labels:['streetwear'], colors:['Black'], sizes:['M','L'], price:2499 },
  { id:'2', title:'Blue Cargo Pants', description:'Relaxed utility fit', category:'Cargo Pants', labels:['utility'], colors:['Blue'], sizes:['S','M'], price:1999 },
  { id:'3', title:'Classic White Tee', description:'Everyday cotton t-shirt', category:'T-Shirts', labels:['basics'], colors:['White'], sizes:['S','M','L'], price:999 },
];

test('smart search normalizes whitespace and punctuation', () => {
  assert.equal(normalizeSearchQuery('  black   hoodie! '), 'black hoodie');
  assert.deepEqual(getSearchTokens('blue-cargo pants'), ['blue','cargo','pants']);
});

test('smart search ranks exact title and attribute matches above loose matches', () => {
  assert.deepEqual(searchProducts(products, 'black hoodie').map(p => p.id), ['1']);
  assert.deepEqual(searchProducts(products, 'blue').map(p => p.id), ['2']);
  assert.deepEqual(searchProducts(products, 'cotton').map(p => p.id), ['3','1']);
});

test('autocomplete suggests a close product when the query has a small typo', () => {
  assert.equal(getSearchSuggestions(products, 'hooodie').at(0)?.value, 'Oversized Black Hoodie');
});

test('autocomplete suggestions combine products, categories and labels without duplicates', () => {
  assert.deepEqual(getSearchSuggestions(products, 'hood'), [
    { type:'product', value:'Oversized Black Hoodie' },
    { type:'category', value:'Hoodies' }
  ]);
});

test('products page search must keep ordinary text queries intact', () => {
  assert.equal(normalizeSearchQuery('T-Shirts'), 't shirts');
  assert.deepEqual(searchProducts(products, 'T-Shirts').map(p => p.id), ['3']);
});
