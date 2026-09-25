import Link from 'next/link';
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import NotificationsPage from '@/components/NotificationsPage';

export default async function NotificationsRoute(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth/login?next=/account/notifications');

  const {data:notifications}=await supabase
    .from('notifications')
    .select('id,type,title,body,order_id,read_at,created_at')
    .eq('user_id',user.id)
    .order('created_at',{ascending:false})
    .limit(50);

  return <main className="account-page notifications-page">
    <div className="account-shell">
      <Link href="/account" className="back-link"><ArrowLeft size={14}/> Account</Link>
      <div className="notifications-page-heading">
        <span className="eyebrow dark">NOTIFICATION CENTER</span>
        <h1>Stay in the loop.</h1>
        <p>Order updates, delivery progress and return activity — all in one place.</p>
      </div>
      <NotificationsPage initial={notifications||[]} />
    </div>
  </main>;
}
