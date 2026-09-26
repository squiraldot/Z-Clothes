import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/blogger';
import { ProductPurchase } from '@/components/ProductPurchase';
import { ProductGallery } from '@/components/ProductGallery';
import { sanitizeProductHtml } from '@/lib/sanitize-html';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ProductReviews } from '@/components/ProductReviews';
import { ProductRecommendations } from '@/components/ProductRecommendations';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://z-clothes-sia-sprides-projects.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found', robots: { index: false, follow: true } };
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `${SITE}/products/${product.slug}` },
    openGraph: {
      title: `${product.title} — Z-Clothes`,
      description: product.description,
      type: 'website',
      siteName: 'Z-Clothes',
      url: `${SITE}/products/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.title} — Z-Clothes`,
      description: product.description,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return notFound();

  const galleryImages = [p.image, ...p.images.filter((image) => image !== p.image)];
  const allProducts = await getProducts();
  const related = allProducts.filter((item) => item.id !== p.id).map((item) => {
    const sameCategory = item.category.toLowerCase() === p.category.toLowerCase() ? 4 : 0;
    const sharedLabels = (item.labels || []).filter((label) => (p.labels || []).some((other) => other.toLowerCase() === label.toLowerCase())).length * 2;
    const priceFit = Math.abs(item.price - p.price) <= Math.max(500, p.price * 0.35) ? 1 : 0;
    return { item, score: sameCategory + sharedLabels + priceFit };
  }).sort((a, b) => b.score - a.score).slice(0, 8).map(({ item }) => item);
  const safeContent = sanitizeProductHtml(p.contentHtml || '<p>Premium materials, relaxed proportions and a modern Z-Clothes silhouette.</p>');
  const supabase = await createSupabaseServerClient();
  const { data: reviews } = await supabase.from('product_reviews').select('id,rating,title,body,created_at').eq('product_id', p.id).order('created_at', { ascending: false }).limit(50);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description,
    image: galleryImages,
    category: p.category,
    sku: p.id,
    brand: { '@type': 'Brand', name: 'Z-Clothes' },
    offers: {
      '@type': 'Offer',
      priceCurrency: p.currency || 'INR',
      price: p.price,
      availability: 'https://schema.org/InStock',
      url: `${SITE}/products/${p.slug}`,
    },
  };

  return (
    <main className="product-page">
      <RecentlyViewedTracker productId={p.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductGallery title={p.title} category={p.category} images={galleryImages} />
      <div className="product-info">
        <span className="eyebrow dark">{p.category}</span>
        <h1>{p.title}</h1>
        <div className="price">₹{p.price.toLocaleString('en-IN')} {p.compareAtPrice && <del>₹{p.compareAtPrice.toLocaleString('en-IN')}</del>}</div>
        <p className="lead">{p.description}</p>
        <ProductPurchase product={p} />
        <div className="service-grid"><span>◈<b>Free Shipping</b><small>Across India</small></span><span>◇<b>Payments</b><small>Launching soon</small></span><span>○<b>Easy Returns</b><small>Within 7 days</small></span></div>
        <details open><summary>Product details</summary><div className="rich" dangerouslySetInnerHTML={{__html:safeContent}} /></details>
        <details><summary>Shipping & returns</summary><div className="rich"><p>Free shipping across India. Returns are accepted within 7 days for eligible unworn items.</p></div></details>
      </div>
      <ProductReviews productId={p.id} reviews={reviews || []} />
      <ProductRecommendations products={related} />
      <RecentlyViewed />
    </main>
  );
}
