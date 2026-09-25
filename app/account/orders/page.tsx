import Link from 'next/link';
import { ArrowLeft, Package } from '@phosphor-icons/react/dist/ssr';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function money(value:number,currency='INR'){
  return new Intl.NumberFormat('en-IN',{style:'currency',currency}).format(value);
}
function date(value:string){
  return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(value));
}
function label(status:string){
  return status.replaceAll('_',' ').replace(/\b\w/g,(m)=>m.toUpperCase());
}

export default async function OrdersPage(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth/login?next=/account/orders');

  const {data:orders,error}=await supabase
    .from('orders')
    .select('id,order_number,status,currency,subtotal,shipping,total,email,created_at,updated_at')
    .eq('user_id',user.id)
    .order('created_at',{ascending:false});

  const ids=(orders??[]).map((o)=>o.id);
  const {data:items}=ids.length
    ? await supabase.from('order_items').select('id,order_id,title,price,quantity,image,color,size').in('order_id',ids)
    : {data:[]};

  return <main className="account-page orders-page">
    <div className="account-shell">
      <div className="orders-heading">
        <div>
          <Link href="/account" className="back-link"><ArrowLeft size={14}/> Account</Link>
          <span className="eyebrow dark">ORDER HISTORY</span>
          <h1>Your orders.</h1>
          <p>{orders?.length ? 'A record of every order saved to your Z-Clothes account.' : 'Your saved orders will appear here after you place your first order.'}</p>
        </div>
      </div>
      {error ? <div className="orders-empty"><Package size={34}/><h2>Orders are temporarily unavailable.</h2><p>Please try again in a moment.</p></div>
      : !orders?.length ? <div className="orders-empty"><Package size={34}/><h2>No orders yet.</h2><p>Once you create an order, it will stay attached to your account here.</p><Link href="/products" className="btn dark">Browse collection</Link></div>
      : <div className="orders-list">{orders.map((order)=>{
        const orderItems=(items??[]).filter((item)=>item.order_id===order.id);
        return <Link href={'/account/orders/'+order.id} className="order-card" key={order.id}>
          <div className="order-card-head"><div><span className="eyebrow dark">ORDER</span><h2>{order.order_number}</h2><p>{date(order.created_at)}</p></div><span className="order-status">{label(order.status)}</span></div>
          <div className="order-preview">{orderItems.slice(0,3).map((item)=><img key={item.id} src={item.image} alt="" />)}<div className="order-preview-meta"><span>{orderItems.reduce((sum,item)=>sum+item.quantity,0)} item{orderItems.reduce((sum,item)=>sum+item.quantity,0)===1?'':'s'}</span><strong>{money(Number(order.total),order.currency)}</strong></div></div>
        </Link>
      })}</div>}
    </div>
  </main>;
}
