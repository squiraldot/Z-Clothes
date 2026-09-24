import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/blogger';
import { ProductPurchase } from '@/components/ProductPurchase';
import { ProductGallery } from '@/components/ProductGallery';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://z-clothes-sia-sprides-projects.vercel.app';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };
  return {
    title: product.title,
    description: product.description,
    alternates: { canonical: `${SITE}/products/${product.slug}` },
    openGraph: {
      title: `${product.title} — Z-Clothes`,
      description: product.description,
      type: 'website',
      siteName: 'Z-Clothes',
      images: product.image ? [{ url: product.image, alt: product.title }] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return notFound();

  const galleryImages = [p.image, ...p.images.filter((image) => image !== p.image)];
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
      url: `${SITE}/products/${p.slug}`,
    },
  };

  return (
    <main className="product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductGallery title={p.title} category={p.category} images={galleryImages} />
      <div className="product-info">
        <span className="eyebrow dark">{p.category}</span>
        <h1>{p.title}</h1>
        <div className="price">₹{p.price.toLocaleString('en-IN')} {p.compareAtPrice && <del>₹{p.compareAtPrice.toLocaleString('en-IN')}</del>}</div>
        <p className="lead">{p.description}</p>
        <ProductPurchase product={p} />
        <div className="service-grid"><span>◈<b>Free Shipping</b><small>Across India</small></span><span>◇<b>Payments</b><small>Launching soon</small></span><span>○<b>Easy Returns</b><small>Within 7 days</small></span></div>
        <details open><summary>Product details</summary><div className="rich" dangerouslySetInnerHTML={{__html:p.contentHtml||'<p>Premium materials, relaxed proportions and a modern Z-Clothes silhouette.</p>'}}/></details>
        <details><summary>Shipping & returns</summary><div className="rich"><p>Free shipping across India. Returns are accepted within 7 days for eligible unworn items.</p></div></details>
      </div>
    </main>
  );
}
