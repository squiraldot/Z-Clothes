import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AdminOrderStatus from '@/components/AdminOrderStatus';

export const metadata = { title: 'Admin — Z-Clothes', robots: { index: false, follow: false } };

function money(value:number,currency='INR'){
  return new Intl.NumberFormat('en-IN',{style:'currency',currency}).format(value);
}
function date(value:string){
  return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
}
function label(status:string){
  return status.replaceAll('_',' ').replace(/\b\w/g,(m)=>m.toUpperCase());
}

export default async function AdminPage(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth/login?next=/admin');

  const {data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profile?.role!=='admin') redirect('/account');

  const {data:orders,error}=await supabase
    .from('orders')
    .select('id,order_number,status,total,currency,email,created_at,shipping_name,shipping_city,shipping_state')
    .order('created_at',{ascending:false})
    .limit(100);

  return <main className="account-page admin-page"><div className="account-shell">
    <div className="account-heading">
      <div><span className="eyebrow dark">Z-CLOTHES ADMIN</span><h1>Order desk.</h1><p>Review recent orders and keep fulfilment status up to date.</p></div>
    </div>
    {error ? <section className="account-panel"><h2>Orders are temporarily unavailable.</h2><p>Please try again in a moment.</p></section>
    : <section className="account-panel admin-orders-panel">
      <div className="panel-heading"><span className="eyebrow dark">RECENT ORDERS</span><strong>{orders?.length ?? 0} shown</strong></div>
      <div className="admin-order-list">
        {(orders??[]).map(order=><article className="admin-order-row" key={order.id}>
          <div><span className="eyebrow dark">{order.order_number}</span><strong>{order.shipping_name || order.email || 'Customer'}</strong><small>{date(order.created_at)} · {order.shipping_city || 'No city'}{order.shipping_state ? ', '+order.shipping_state : ''}</small></div>
          <div className="admin-order-meta"><strong>{money(Number(order.total),order.currency)}</strong><AdminOrderStatus orderId={order.id} status={order.status}/></div>
        </article>)}
        {!orders?.length&&<p className="checkout-note">No orders yet.</p>}
      </div>
    </section>}
  </div></main>;
}
