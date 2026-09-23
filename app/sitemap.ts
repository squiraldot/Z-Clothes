import type { MetadataRoute } from 'next';
import { getProducts } from '@/lib/blogger';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://z-clothes-sia-sprides-projects.vercel.app';
  const staticRoutes = ['', '/products', '/about', '/contact', '/policies', '/wishlist', '/checkout'];
  const products = await getProducts();
  return [
    ...staticRoutes.map((path) => ({ url: `${base}${path}`, changeFrequency: path === '/products' ? 'daily' as const : 'weekly' as const, priority: path === '' ? 1 : .6 })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.published ? new Date(p.published) : undefined, changeFrequency: 'weekly' as const, priority: .8 })),
  ];
}
