'use client';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="centered-page error-page"><span className="eyebrow dark">TEMPORARILY UNAVAILABLE</span><h1>Something went off-script.</h1><p>We couldn't load this page right now. Try again or head back to the collection.</p><div className="error-actions"><button className="btn dark" onClick={() => reset()}>Try again</button><a className="btn outline" href="/products">Shop collection</a></div></main>
}
