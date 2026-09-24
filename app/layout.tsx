import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://z-clothes-sia-sprides-projects.vercel.app'),
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
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        <div id="main-content">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
