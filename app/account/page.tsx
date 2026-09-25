import Link from 'next/link';
import { ArrowRight, Bell, Heart, MapPin, Package, UserCircle } from '@phosphor-icons/react/dist/ssr';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { AccountActions } from '@/components/AccountActions';
import { ProfileForm } from '@/components/ProfileForm';

export const metadata = { title: 'My Account — Z-Clothes', robots: { index: false, follow: false } };

function date(value:string){return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value));}
function status(value:string){return value.replaceAll('_',' ').replace(/\\b\\w/g,m=>m.toUpperCase());}

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/account');

  const [{data:profile},{data:orders,count:orderTotal},{data:addresses},{data:wishlist},{data:notifications}] = await Promise.all([
    supabase.from('profiles').select('id,full_name,phone,avatar_url,created_at,updated_at').eq('id',user.id).maybeSingle(),
    supabase.from('orders').select('id,order_number,status,total,currency,created_at',{count:'exact'}).eq('user_id',user.id).order('created_at',{ascending:false}).limit(3),
    supabase.from('addresses').select('id,is_default').eq('user_id',user.id),
    supabase.from('wishlists').select('product_id').eq('user_id',user.id),
    supabase.from('notifications').select('id,read_at').eq('user_id',user.id).limit(50),
  ]);

  const unread=(notifications??[]).filter(n=>!n.read_at).length;
  const orderCount=orderTotal ?? orders?.length ?? 0;
  const addressCount=addresses?.length ?? 0;
  const wishlistCount=wishlist?.length ?? 0;

  return <main className="account-page account-v2"><div className="account-shell">
    <div className="account-v2-head">
      <div className="account-welcome">
        <div className="account-v2-avatar">{profile?.avatar_url?<img src={profile.avatar_url} alt=""/>:<UserCircle size={34}/>}</div>
        <div><span className="eyebrow dark">YOUR Z-CLOTHES ACCOUNT</span><h1>{profile?.full_name ? 'Hello, '+profile.full_name.split(' ')[0]+'.' : 'Welcome back.'}</h1><p>{user.email}</p></div>
      </div>
      <AccountActions />
    </div>

    <nav className="account-v2-nav" aria-label="Account navigation">
      <Link className="active" href="/account">Overview</Link>
      <Link href="/account/orders">Orders</Link>
      <Link href="/account/addresses">Addresses</Link>
      <Link href="/wishlist">Wishlist</Link>
      <Link href="/account/notifications">Notifications{unread>0&&<span>{unread}</span>}</Link>
    </nav>

    <div className="account-stat-grid">
      <Link href="/account/orders" className="account-stat"><Package size={19}/><div><span>Orders</span><strong>{orderCount}</strong></div><ArrowRight size={15}/></Link>
      <Link href="/wishlist" className="account-stat"><Heart size={19}/><div><span>Saved pieces</span><strong>{wishlistCount}</strong></div><ArrowRight size={15}/></Link>
      <Link href="/account/addresses" className="account-stat"><MapPin size={19}/><div><span>Addresses</span><strong>{addressCount}</strong></div><ArrowRight size={15}/></Link>
      <Link href="/account/notifications" className="account-stat"><Bell size={19}/><div><span>Unread updates</span><strong>{unread}</strong></div><ArrowRight size={15}/></Link>
    </div>

    <div className="account-v2-grid">
      <section className="account-panel account-profile-panel"><span className="eyebrow dark">PROFILE</span><h2>Make it yours.</h2><p>Keep your name, photo and contact details ready for future shopping, addresses and orders.</p><ProfileForm userId={user.id} initialName={profile?.full_name ?? ''} initialPhone={profile?.phone ?? ''} initialAvatarUrl={profile?.avatar_url ?? ''} /></section>

      <section className="account-panel account-recent-orders"><div className="account-panel-top"><div><span className="eyebrow dark">RECENT ORDERS</span><h2>Your latest pieces.</h2></div><Link href="/account/orders">View all <ArrowRight size={14}/></Link></div>
        {!orders?.length?<div className="account-card-empty"><Package size={25}/><p>No orders yet.</p><Link href="/products">Start shopping →</Link></div>
        :<div className="account-mini-orders">{orders.map(o=><Link href={'/account/orders/'+o.id} key={o.id}><div><b>{o.order_number}</b><span>{date(o.created_at)} · {status(o.status)}</span></div><strong>₹{Number(o.total).toLocaleString('en-IN')} <ArrowRight size={13}/></strong></Link>)}</div>}
      </section>

      <section className="account-panel account-shortcuts"><span className="eyebrow dark">QUICK ACCESS</span><h2>Everything in reach.</h2>
        <div className="account-shortcut-grid"><Link href="/wishlist"><Heart size={18}/><span>Wishlist</span><ArrowRight size={13}/></Link><Link href="/account/addresses"><MapPin size={18}/><span>Addresses</span><ArrowRight size={13}/></Link><Link href="/account/notifications"><Bell size={18}/><span>Notifications</span><ArrowRight size={13}/></Link><Link href="/products"><span className="shortcut-z">Z</span><span>Shop collection</span><ArrowRight size={13}/></Link></div></section>
    </div>
  </div></main>;
}
