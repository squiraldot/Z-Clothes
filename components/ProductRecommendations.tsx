import type { Product } from '@/lib/types';
import { HorizontalRail } from '@/components/HorizontalRail';

export function ProductRecommendations({products}:{products:Product[]}){
  if(!products.length)return null;
  return <section className="product-discovery-section"><div className="section-head"><div><span className="eyebrow dark">CURATED FOR YOU</span><h2>You May Also Like</h2></div></div><HorizontalRail products={products}/></section>;
}
