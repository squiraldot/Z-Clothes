export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  category: string;
  labels: string[];
  image: string;
  images: string[];
  sizes: string[];
  colors: string[];
  dodoProductId?: string;
  url?: string;
  published?: string;
  contentHtml?: string;
};
