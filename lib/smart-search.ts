import type { Product } from '@/lib/types';

export type SearchSuggestion = { type: 'product' | 'category' | 'label'; value: string };

export function normalizeSearchQuery(query: string) {
  return query.replace(/[^p{L}p{N}s-]/gu, ' ').replace(/[-]+/g, ' ').replace(/s+/g, ' ').trim().toLowerCase();
}

export function getSearchTokens(query: string) {
  return normalizeSearchQuery(query).split(' ').filter(Boolean);
}

function scoreProduct(product: Product, tokens: string[], query: string) {
  const title = product.title.toLowerCase();
  const category = product.category.toLowerCase();
  const labels = (product.labels || []).join(' ').toLowerCase();
  const colors = (product.colors || []).join(' ').toLowerCase();
  const description = product.description.toLowerCase();
  const haystack = [title, category, labels, colors, description].join(' ');
  if (!tokens.length || !tokens.every((token) => haystack.includes(token))) return -1;
  let score = 0;
  if (title === query) score += 100;
  if (title.includes(query)) score += 60;
  if (category === query) score += 50;
  if (category.includes(query)) score += 30;
  for (const token of tokens) {
    if (title.includes(token)) score += 20;
    if (category.includes(token)) score += 14;
    if (labels.includes(token)) score += 10;
    if (colors.includes(token)) score += 12;
    if (description.includes(token)) score += 4;
  }
  return score;
}

export function searchProducts(products: Product[], query: string) {
  const normalized = normalizeSearchQuery(query);
  const tokens = getSearchTokens(normalized);
  if (!tokens.length) return [...products];
  return products
    .map((product) => ({ product, score: scoreProduct(product, tokens, normalized) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => b.score - a.score || a.product.title.localeCompare(b.product.title))
    .map((entry) => entry.product);
}

export function getSearchSuggestions(products: Product[], query: string, limit = 6): SearchSuggestion[] {
  const normalized = normalizeSearchQuery(query);
  if (normalized.length < 2) return [];
  const result: SearchSuggestion[] = [];
  const seen = new Set<string>();
  const add = (type: SearchSuggestion['type'], value: string) => {
    const key = value.toLowerCase();
    if (!value || seen.has(key) || result.length >= limit) return;
    seen.add(key); result.push({ type, value });
  };

  for (const product of searchProducts(products, normalized).slice(0, 4)) add('product', product.title);
  for (const category of [...new Set(products.map((p) => p.category).filter(Boolean))]) {
    if (category.toLowerCase().includes(normalized)) add('category', category);
  }
  for (const label of [...new Set(products.flatMap((p) => p.labels || []))]) {
    if (label.toLowerCase().includes(normalized)) add('label', label);
  }
  return result.slice(0, limit);
}
