'use client';

import Link from 'next/link';

export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <div className="error-card">
        <span className="eyebrow dark">PRODUCT UNAVAILABLE</span>
        <h1>We couldn’t load this piece.</h1>
        <p>The collection service may be temporarily unavailable. Try again, or return to the full edit.</p>
        <div className="error-actions">
          <button type="button" className="btn dark" onClick={() => reset()}>Try again</button>
          <Link href="/products" className="btn light">Browse collection</Link>
        </div>
      </div>
    </main>
  );
}
