import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/blogger';
import { ProductPurchase } from '@/components/ProductPurchase';
import { ProductGallery } from '@/components/ProductGallery';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return notFound();

  const galleryImages = [p.image, ...p.images.filter((image) => image !== p.image)];

  return (
    <main className="product-page">
      <ProductGallery title={p.title} category={p.category} images={galleryImages} />
      <div className="product-info">
        <span className="eyebrow dark">{p.category}</span>
        <h1>{p.title}</h1>
        <div className="rating"><span className="stars">★★★★★</span><span>4.8 · 120 reviews</span></div>
        <div className="price">₹{p.price.toLocaleString('en-IN')} {p.compareAtPrice&&<del>₹{p.compareAtPrice.toLocaleString('en-IN')}</del>}</div>
        <p className="lead">{p.description}</p>
        <ProductPurchase product={p} />
        <div className="service-grid">
          <span>◈<b>Free Shipping</b><small>Across India</small></span>
          <span>◇<b>Payments</b><small>Launching soon</small></span>
          <span>○<b>Easy Returns</b><small>Within 7 days</small></span>
        </div>
        <details open><summary>Product details</summary><div className="rich" dangerouslySetInnerHTML={{__html:p.contentHtml||'<p>Premium materials, relaxed proportions and a modern Z-Clothes silhouette.</p>'}}/></details>
        <details><summary>Shipping & returns</summary><div className="rich"><p>Free shipping across India. Returns are accepted within 7 days for eligible unworn items.</p></div></details>
      </div>
    </main>
  );
}
