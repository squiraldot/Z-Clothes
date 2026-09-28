import Link from 'next/link';
import { ArrowLeft, SlidersHorizontal } from '@phosphor-icons/react/dist/ssr';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AccountPreferencesForm } from '@/components/AccountPreferencesForm';

export const metadata = {
  title: 'Preferences — Z-Clothes',
  robots: { index: false, follow: false },
};

export default async function AccountPreferencesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login?next=/account/preferences');

  const { data: preferences } = await supabase
    .from('account_preferences')
    .select('email_frequency,new_arrivals,offers,style_edits,personalized_recommendations')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <main className="account-page">
      <div className="account-shell">
        <Link href="/account" className="back-link"><ArrowLeft size={14} /> Account</Link>
        <div className="account-preferences-heading">
          <span className="eyebrow dark">ACCOUNT PREFERENCES</span>
          <div className="account-preferences-title">
            <div className="account-preferences-icon"><SlidersHorizontal size={23} /></div>
            <div>
              <h1>Choose what reaches you.</h1>
              <p>Control promotional email cadence, topics and future product recommendations from one place.</p>
            </div>
          </div>
        </div>
        <AccountPreferencesForm userId={user.id} initialPreferences={preferences} />
      </div>
    </main>
  );
}
