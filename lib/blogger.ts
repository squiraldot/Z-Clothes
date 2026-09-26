import { cache } from 'react';
import type { Product } from './types';
import { demoProducts } from './demo-products';

const API = 'https://www.googleapis.com/blogger/v3';

function text(html: string) { return html.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim(); }
function attr(html: string, name: string) { const m = html.match(new RegExp(`${name}=["']([^"']+)["']`, 'i')); return m?.[1] ?? ''; }
function meta(html: string, key: string) { return attr(html, `data-${key}`); }
function images(html: string) { return [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]); }

export function parsePost(post: any): Product {
  const html = post.content ?? '';
  const imgs = images(html);
  const labels = Array.isArray(post.labels) ? post.labels : [];
  const category = meta(html,'category') || labels[0] || 'Collection';
  const price = Number(meta(html,'price') || 0);
  const compareAt = Number(meta(html,'compare-price') || 0);
  const sizes = (meta(html,'sizes') || 'S,M,L,XL').split(',').map((x:string)=>x.trim()).filter(Boolean);
  const colors = (meta(html,'colors') || 'Black').split(',').map((x:string)=>x.trim()).filter(Boolean);
  const dodoProductId = meta(html,'dodo-product-id');
  const stockValue = meta(html,'stock');
  const stock = stockValue === '' ? undefined : Math.max(0, Number(stockValue) || 0);
  const slug = (post.url || '').split('/').filter(Boolean).pop() || post.id;
  // Product images are gallery assets only. Keep them out of the rich description so the same images are not rendered twice.
  const descriptionHtml = html.replace(/<img\b[^>]*>/gi, '');
  return { id: post.id, slug, title: post.title, description: meta(html,'description') || text(html).slice(0,220), price, compareAtPrice: compareAt || undefined, currency: meta(html,'currency') || 'INR', category, labels, image: imgs[0] || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85', images: imgs.slice(0,6), sizes, colors, dodoProductId, stock, url: post.url, published: post.published, contentHtml: descriptionHtml };
}

export const getProducts = cache(async (): Promise<Product[]> => {
  const blogId = process.env.BLOGGER_BLOG_ID;
  const key = process.env.BLOGGER_API_KEY;
  if (!blogId || !key) return demoProducts;
  let pageToken = '';
  const posts:any[] = [];
  do {
    const url = `${API}/blogs/${encodeURIComponent(blogId)}/posts?key=${encodeURIComponent(key)}&fetchBodies=true&fetchImages=true&maxResults=50&orderBy=published&status=live${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    let res: Response | null = null;
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        res = await fetch(url, {
          next: { revalidate: 60, tags: ['zclothes-products'] },
          signal: AbortSignal.timeout(8000),
        });
        if (res.ok) break;
        lastError = new Error(`Blogger API failed: ${res.status}`);
      } catch (error) {
        lastError = error;
      }
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
    }
    if (!res?.ok) throw lastError instanceof Error ? lastError : new Error('Blogger API request failed');
    const data = await res.json();
    posts.push(...(data.items ?? []));
    pageToken = data.nextPageToken || '';
  } while (pageToken && posts.length < 500);
  return posts.map(parsePost);
});

export const getProduct = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find(p=>p.slug===slug || p.id===slug);
});
