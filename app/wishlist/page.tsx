import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wishlist',
  robots: { index: false, follow: true },
};

import WishlistClient from './WishlistClient';

export default function WishlistPage() { return <WishlistClient />; }
