import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReviewSummary,
  filterAndSortReviews,
  getReviewSortOptions,
} from '../lib/review-experience.ts';

const reviews = [
  { id: 'a', rating: 5, title: 'Great', body: 'Soft', created_at: '2026-09-20T00:00:00Z' },
  { id: 'b', rating: 4, title: 'Good', body: 'Fits', created_at: '2026-09-21T00:00:00Z' },
  { id: 'c', rating: 2, title: 'Okay', body: 'Runs small', created_at: '2026-09-22T00:00:00Z' },
];

test('review summary exposes average and rating distribution', () => {
  const summary = buildReviewSummary(reviews);
  assert.equal(summary.count, 3);
  assert.equal(summary.average, 3.7);
  assert.deepEqual(summary.distribution, { 5: 1, 4: 1, 3: 0, 2: 1, 1: 0 });
});

test('review filters support star filtering and stable sort modes', () => {
  assert.deepEqual(filterAndSortReviews(reviews, { rating: 5, sort: 'recent' }).map((r) => r.id), ['a']);
  assert.deepEqual(filterAndSortReviews(reviews, { rating: 'all', sort: 'highest' }).map((r) => r.id), ['a', 'b', 'c']);
  assert.deepEqual(filterAndSortReviews(reviews, { rating: 'all', sort: 'lowest' }).map((r) => r.id), ['c', 'b', 'a']);
});

test('review sort options keep a small predictable set', () => {
  assert.deepEqual(getReviewSortOptions(), [
    { value: 'recent', label: 'Most recent' },
    { value: 'highest', label: 'Highest rated' },
    { value: 'lowest', label: 'Lowest rated' },
  ]);
});
