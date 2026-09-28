import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/blogger';
import { getSearchSuggestions } from '@/lib/smart-search';

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') || '';
  if (query.trim().length < 2) return NextResponse.json([]);
  try {
    const products = await getProducts();
    return NextResponse.json(getSearchSuggestions(products, query), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch {
    return NextResponse.json([], { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}
