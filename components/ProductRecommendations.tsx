import type { Product } from '@/lib/types';
import { HorizontalRail } from '@/components/HorizontalRail';

export function ProductRecommendations({ products, title='You May Also Like', eyebrow='RECOMMENDED FOR YOU' }:{products:Product[];title?:string;eyebrow?:string}){
  if(!products.length)return null;
  return <section className="product-discovery-section"><div className="section-head"><div><span className="eyebrow dark">{eyebrow}</span><h2>{title}</h2></div></div><HorizontalRail products={products}/></section>;
}
