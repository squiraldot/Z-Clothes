'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function verifyResetLink() {
      const supabase = createSupabaseBrowserClient();
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (mounted) setError('This reset link is invalid or has expired. Please request a new one.');
          return;
        }
        window.history.replaceState({}, document.title, '/auth/reset-password');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!session) {
        setError('This reset link is invalid or has expired. Please request a new one.');
        return;
      }

      setReady(true);
    }

    verifyResetLink().catch(() => {
      if (mounted) setError('We could not verify this reset link. Please request a new one.');
    });

    return () => { mounted = false; };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!ready) return;

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await supabase.auth.signOut();
      setMessage('Your password has been updated. Redirecting to sign in…');
      window.setTimeout(() => {
        router.push('/auth/login');
        router.refresh();
      }, 900);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow dark">Z-CLOTHES ACCOUNT</span>
        <h1>Choose a new password.</h1>
        <p className="auth-intro">Set a new password for your Z-Clothes account.</p>

        {!ready && !error && <p className="auth-message" role="status">Verifying your secure reset link…</p>}

        {ready && <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-message" role="alert">{error}</p>}
          {message && <p className="auth-message" role="status">{message}</p>}

          <button className="btn dark auth-submit" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>}

        {error && <p className="auth-message" role="alert">{error}</p>}

        <p className="auth-switch">
          Need to start again? <Link href="/auth/forgot-password">Send another reset link</Link>
        </p>
        <Link className="auth-back" href="/products">Continue shopping →</Link>
      </div>
    </main>
  );
}
