import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="centered-page not-found-page">
      <span className="eyebrow dark">404 / PAGE NOT FOUND</span>
      <h1>Lost your way?</h1>
      <p>The page you are looking for has moved, disappeared, or never existed.</p>
      <Link href="/products" className="btn dark">Explore Z-Clothes →</Link>
    </main>
  );
}
