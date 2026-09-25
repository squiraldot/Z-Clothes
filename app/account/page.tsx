'use server';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AccountActions } from '@/components/AccountActions';
import { ProfileForm } from '@/components/ProfileForm';

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/account');
  const { data: profile } = await supabase.from('profiles').select('id, full_name, phone, avatar_url, created_at, updated_at').eq('id', user.id).maybeSingle();
  return <main className="account-page"><div className="account-shell">
    <div className="account-heading"><div><span className="eyebrow dark">YOUR Z-CLOTHES ACCOUNT</span><h1>Welcome back.</h1><p>{user.email}</p></div><AccountActions /></div>
    <div className="account-grid">
      <section className="account-panel account-profile-panel"><span className="eyebrow dark">PROFILE</span><h2>Make it yours.</h2><p>Keep your name, photo and contact details ready for future shopping, addresses and orders.</p><ProfileForm userId={user.id} initialName={profile?.full_name ?? ''} initialPhone={profile?.phone ?? ''} initialAvatarUrl={profile?.avatar_url ?? ''} /></section>
      <section className="account-panel"><span className="eyebrow dark">SHOPPING</span><h2>Your wishlist stays close.</h2><p>Your current wishlist is still stored locally. We’ll migrate it to your account in Phase 19.</p><Link href="/wishlist" className="btn light account-link">Open wishlist</Link></section>
      <section className="account-panel"><span className="eyebrow dark">ORDERS</span><h2>Orders are coming next.</h2><p>Order history will be connected after the account, address and order database phases are complete.</p><span className="account-status muted">NOT CONNECTED YET</span></section>
      <section className="account-panel"><span className="eyebrow dark">SHOP</span><h2>Back to the edit.</h2><p>Keep exploring the current collection while your account foundation is in place.</p><Link href="/products" className="btn dark account-link">Browse collection</Link></section>
    </div>
  </div></main>;
}
