import type { Product } from '@/lib/types'; import { ProductCard } from './ProductCard';
export function HorizontalRail({products}:{products:Product[]}){return <div className="rail">{products.map(p=><ProductCard key={p.id} p={p}/>)}</div>}
