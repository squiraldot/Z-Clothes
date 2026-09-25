import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AddressManager from '@/components/AddressManager';

export const metadata = { title: 'Addresses — Z-Clothes', robots: { index: false, follow: false } };

export default async function AddressesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/account/addresses');
  return <main className="account-page"><AddressManager /></main>;
}
