import type { Product } from '@/lib/types';

export type SearchSuggestion = { type: 'product' | 'category' | 'label'; value: string };

export function normalizeSearchQuery(query: string) {
  return query.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/[-]+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

export function getSearchTokens(query: string) {
  return normalizeSearchQuery(query).split(' ').filter(Boolean);
}

function editDistance(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(current[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = current[j];
  }
  return prev[b.length];
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

function parseSearchQualifiers(query: string) {
  let textQuery = query;
  let size: string | undefined;
  let maxPrice: number | undefined;

  const sizeMatch = textQuery.match(/\bsize\s+(xxxl|xxl|xl|xs|xxs|small|medium|large|s|m|l)\b|\b(xxxl|xxl|xl|xs|xxs|small|medium|large|s|m|l)\s+size\b/i);
  if (sizeMatch) {
    const raw = (sizeMatch[1] || sizeMatch[2]).toLowerCase();
    size = ({ small: 'S', medium: 'M', large: 'L' } as Record<string, string>)[raw] || raw.toUpperCase();
    textQuery = textQuery.replace(sizeMatch[0], ' ');
  }

  const priceMatch = textQuery.match(/\b(?:under|below|less\s+than|up\s+to|upto)\s*(?:₹|rs\.?|inr)?\s*([\d,]+)\b/i);
  if (priceMatch) {
    maxPrice = Number(priceMatch[1].replace(/,/g, ''));
    textQuery = textQuery.replace(priceMatch[0], ' ');
  }

  return { textQuery: normalizeSearchQuery(textQuery), size, maxPrice };
}

export function searchProducts(products: Product[], query: string) {
  const normalized = normalizeSearchQuery(query);
  const { textQuery, size, maxPrice } = parseSearchQualifiers(normalized);
  const tokens = getSearchTokens(textQuery);

  return products
    .map((product) => ({
      product,
      score: scoreProduct(product, tokens, textQuery),
      sizeMatch: !size || (product.sizes || []).some((value) => value.toLowerCase() === size.toLowerCase()),
      priceMatch: maxPrice === undefined || product.price <= maxPrice,
    }))
    .filter((entry) => entry.score >= 0 && entry.sizeMatch && entry.priceMatch)
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

  const direct = searchProducts(products, normalized);
  for (const product of direct.slice(0, 4)) add('product', product.title);
  if (!direct.length) {
    const candidates = products.flatMap((product) => [
      { type: 'product' as const, value: product.title },
      { type: 'category' as const, value: product.category },
      ...(product.labels || []).map((value) => ({ type: 'label' as const, value })),
    ]);
    const fuzzy = [...new Map(candidates.map((candidate) => [candidate.value.toLowerCase(), candidate])).values()].filter((candidate) => {
      const words = normalizeSearchQuery(candidate.value).split(' ');
      return getSearchTokens(normalized).some((token) => words.some((word) => word.length >= 4 && editDistance(token, word) <= 2));
    });
    for (const candidate of fuzzy.slice(0, 4)) add(candidate.type, candidate.value);
  }
  for (const category of [...new Set(products.map((p) => p.category).filter(Boolean))]) {
    if (category.toLowerCase().includes(normalized)) add('category', category);
  }
  for (const label of [...new Set(products.flatMap((p) => p.labels || []))]) {
    if (label.toLowerCase().includes(normalized)) add('label', label);
  }
  return result.slice(0, limit);
}
