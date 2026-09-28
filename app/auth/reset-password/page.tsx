import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from '@/components/ResetPasswordForm';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/forgot-password?error=expired');
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow dark">Z-CLOTHES ACCOUNT</span>
        <h1>Choose a new password.</h1>
        <p className="auth-intro">Set a new password for your Z-Clothes account.</p>
        <ResetPasswordForm />
        <Link className="auth-back" href="/products">Continue shopping →</Link>
      </div>
    </main>
  );
}
