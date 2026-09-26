import type { Product } from '@/lib/types';
import { HorizontalRail } from '@/components/HorizontalRail';

export function NewDropSection({products}:{products:Product[]}){
  if(!products.length)return null;
  return <section className="section new-drop-section"><div className="section-head"><div><span className="eyebrow dark">JUST IN</span><h2>New Drop</h2></div></div><HorizontalRail products={products}/></section>;
}
