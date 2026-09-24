import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { getProducts } from '@/lib/blogger';
import { HorizontalRail } from '@/components/HorizontalRail';
import { ImmersiveHero } from '@/components/ImmersiveHero';

const categoryNames = ['T-Shirts','Hoodies','Jackets','Cargo Pants','Shirts'];
const seasonImage='https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=2200&q=90';
const storyImage='https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90';

export default async function Home() {
  let products = [];
  try {
    products = await getProducts();
  } catch {
    // Keep the storefront shell available if Blogger is temporarily unavailable.
  }
  const categoryCards=categoryNames.map((name)=>({name,product:products.find((p)=>p.category.toLowerCase()===name.toLowerCase())??products.find((p)=>p.title.toLowerCase().includes(name.toLowerCase().replace(' ','')))}));
  return <main>
    <ImmersiveHero/>
    <section className="section featured">
      <div className="section-head"><div><span className="eyebrow dark">CURATED FOR YOU</span><h2>Featured Collections</h2></div><span className="scroll-hint">Scroll horizontally →</span></div>
      <div className="category-rail">{categoryCards.map(({name,product})=><Link href={`/products?category=${encodeURIComponent(name)}`} className="category-card" key={name}><Image src={product?.image??products[0]?.image??'/icon.svg'} alt="" fill sizes="(max-width: 560px) 78vw, 260px"/><div><b>{name}</b><span>Explore →</span></div></Link>)}</div>
    </section>
    <section className="section"><div className="section-head"><div><span className="eyebrow dark">THE LATEST EDIT</span><h2>Featured Products</h2></div><Link href="/products" className="text-link">View all →</Link></div><div className="featured-products-rail">{products.length ? <HorizontalRail products={products.slice(0,8)}/> : <div className="home-empty-products"><p>The latest edit is being prepared.</p><Link href="/products" className="text-link">Browse collection →</Link></div>}</div></section>
    <section className="season"><Image src={seasonImage} alt="New season Z-Clothes campaign" fill sizes="100vw" quality={82}/><div><span className="eyebrow">NEW SEASON</span><h2>The current edit</h2><p>Selected styles, made for now.</p><Link href="/products" className="btn light">Explore the edit <ArrowRight/></Link></div></section>
    <section className="trust-strip"><div>◈ <b>Free Shipping</b><span>Across India</span></div><div>◇ <b>Payments</b><span>Launching soon</span></div><div>○ <b>Easy Returns</b><span>Within 7 days</span></div><div>✦ <b>Support</b><span>Mon–Sat · 10 AM–7 PM</span></div></section>
    <section className="manifesto"><div className="manifesto-image"><Image src={storyImage} alt="Z-Clothes lifestyle" fill sizes="(max-width: 800px) 100vw, 55vw" quality={82}/></div><div className="manifesto-copy"><span className="eyebrow dark">OUR STORY</span><h2>Style for a better tomorrow.</h2><p>Z-Clothes is more than a clothing brand—it’s a movement for people who express themselves through style. We make premium essentials that fit your journey, wherever it takes you.</p><Link href="/about" className="btn dark">Our journey <ArrowRight/></Link></div></section>
  </main>;
}