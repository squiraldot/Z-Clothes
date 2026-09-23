import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand-block">
          <div className="brand footer-brand">
            <span className="brand-mark">Z</span>
            <span className="brand-word">Z-CLOTHES</span>
          </div>
          <p>Trendy. Timeless. You.<br />Premium essentials for a bolder everyday.</p>
          <span className="footer-signature">WEAR YOUR STORY.</span>
        </div>

        <div>
          <h4>Explore</h4>
          <Link href="/">Home</Link>
          <Link href="/products">Shop all</Link>
          <Link href="/about">Our story</Link>
        </div>

        <div>
          <h4>Support</h4>
          <Link href="/contact">Contact</Link>
          <Link href="/policies">Policies</Link>
          <Link href="/policies#size-guide">Size guide</Link>
        </div>

        <div>
          <h4>Stay in the loop</h4>
          <div className="newsletter">
            <input type="email" placeholder="Your email address" aria-label="Email address" />
            <button aria-label="Subscribe">→</button>
          </div>
          <small>New drops, private offers and style notes.</small>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Z-Clothes. All rights reserved.</span>
        <span>Payments launching soon · Built for Vercel</span>
      </div>
    </footer>
  );
}
