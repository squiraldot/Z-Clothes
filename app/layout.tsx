import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://z-clothes-sia-sprides-projects.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Z-Clothes — Wear Your Story',
    template: '%s — Z-Clothes',
  },
  description: 'Premium clothing for modern people. Discover the Z-Clothes collection.',
  applicationName: 'Z-Clothes',
  keywords: ['Z-Clothes', 'premium clothing', 'streetwear', 'fashion', 'modern essentials'],
  authors: [{ name: 'Z-Clothes' }],
  creator: 'Z-Clothes',
  publisher: 'Z-Clothes',
  category: 'fashion',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Z-Clothes',
    title: 'Z-Clothes — Wear Your Story',
    description: 'Premium clothing for modern people. Discover the Z-Clothes collection.',
    url: SITE,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Z-Clothes — Wear Your Story',
    description: 'Premium clothing for modern people. Discover the Z-Clothes collection.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#10100f',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        <ScrollToTop />
        <div id="main-content">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
