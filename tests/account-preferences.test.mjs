import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ACCOUNT_PREFERENCES,
  normalizeAccountPreferences,
} from '../lib/account-preferences.ts';

test('account preferences expose safe defaults for a new account', () => {
  assert.deepEqual(DEFAULT_ACCOUNT_PREFERENCES, {
    emailFrequency: 'weekly',
    newArrivals: true,
    offers: true,
    styleEdits: false,
    personalizedRecommendations: true,
  });
});

test('account preferences normalize incomplete database values without changing valid choices', () => {
  assert.deepEqual(
    normalizeAccountPreferences({
      emailFrequency: 'monthly',
      newArrivals: false,
      offers: true,
      styleEdits: true,
      personalizedRecommendations: false,
    }),
    {
      emailFrequency: 'monthly',
      newArrivals: false,
      offers: true,
      styleEdits: true,
      personalizedRecommendations: false,
    },
  );

  assert.deepEqual(normalizeAccountPreferences({
    emailFrequency: 'invalid',
    newArrivals: null,
    offers: undefined,
    styleEdits: 1,
    personalizedRecommendations: 'yes',
  }), DEFAULT_ACCOUNT_PREFERENCES);
});
