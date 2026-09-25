import Link from 'next/link';
import { ArrowLeft, Package } from '@phosphor-icons/react/dist/ssr';
import { notFound, redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

function money(value:number,currency='INR'){return new Intl.NumberFormat('en-IN',{style:'currency',currency}).format(value);}
function date(value:string){return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(value));}
function label(status:string){return status.replaceAll('_',' ').replace(/\b\w/g,(m)=>m.toUpperCase());}

const lifecycle=[
  {key:'pending_payment',title:'Order placed',copy:'Your order has been saved and is waiting for payment.'},
  {key:'paid',title:'Payment confirmed',copy:'Payment has been confirmed for this order.'},
  {key:'processing',title:'Preparing your order',copy:'Your pieces are being prepared for dispatch.'},
  {key:'shipped',title:'On the way',copy:'Your order has been handed over for delivery.'},
  {key:'delivered',title:'Delivered',copy:'Your order has been marked as delivered.'},
];

function lifecycleIndex(status:string){
  if(status==='draft') return -1;
  if(status==='cancelled'||status==='refunded') return -1;
  return Math.max(0,lifecycle.findIndex((step)=>step.key===status));
}

export default async function OrderDetailPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user) redirect('/auth/login?next=/account/orders/'+id);

  const {data:order}=await supabase.from('orders').select('id,order_number,status,currency,subtotal,shipping,total,email,created_at,shipping_name,shipping_phone,shipping_line1,shipping_line2,shipping_landmark,shipping_city,shipping_state,shipping_pincode,coupon_code,discount').eq('id',id).eq('user_id',user.id).maybeSingle();
  if(!order) notFound();
  const {data:items}=await supabase.from('order_items').select('id,title,price,quantity,image,color,size').eq('order_id',order.id).order('created_at',{ascending:true});

  return <main className="account-page orders-page">
    <div className="account-shell order-detail">
      <Link href="/account/orders" className="back-link"><ArrowLeft size={14}/> Order history</Link>
      <div className="order-detail-head"><div><span className="eyebrow dark">ORDER DETAILS</span><h1>{order.order_number}</h1><p>Placed {date(order.created_at)}</p></div><span className="order-status">{label(order.status)}</span></div>
      {(order.status==='cancelled'||order.status==='refunded') ? <section className="order-lifecycle order-lifecycle-terminal"><div><span className="eyebrow dark">ORDER LIFECYCLE</span><h2>{label(order.status)}</h2><p>This order is no longer moving through the active delivery flow.</p></div></section> : order.status!=='draft' && <section className="order-lifecycle"><div className="panel-heading"><span className="eyebrow dark">ORDER LIFECYCLE</span><strong>LIVE STATUS</strong></div><div className="lifecycle-track">{lifecycle.map((step,index)=>{const current=lifecycleIndex(order.status); const active=index<=current; return <div className={`lifecycle-step ${active?'active':''} ${index===current?'current':''}`} key={step.key}><span className="lifecycle-dot" aria-hidden="true"></span><div><b>{step.title}</b><p>{index===current ? (order.status==='pending_payment' ? 'Your order is saved. Payment is not collected yet.' : step.copy) : index<current ? 'Completed' : 'Coming next'}</p></div></div>})}</div></section>}

      <div className="order-detail-grid">
        <section className="order-items-panel"><div className="panel-heading"><span className="eyebrow dark">YOUR PIECES</span><strong>{items?.length ?? 0} line item{items?.length===1?'':'s'}</strong></div>
          {items?.map((item)=><div className="order-item" key={item.id}><img src={item.image} alt="" /><div><h2>{item.title}</h2>{(item.color||item.size)&&<p>{[item.color,item.size].filter(Boolean).join(' · ')}</p>}<span>Qty {item.quantity}</span></div><strong>{money(Number(item.price)*item.quantity,order.currency)}</strong></div>)}
          {!items?.length&&<div className="order-empty-items"><Package size={30}/><p>No line items were found for this order.</p></div>}
        </section>
        <aside className="order-summary-panel"><span className="eyebrow dark">SUMMARY</span><div><span>Subtotal</span><strong>{money(Number(order.subtotal),order.currency)}</strong></div><div><span>Shipping</span><strong>{Number(order.shipping) ? money(Number(order.shipping),order.currency) : 'Free'}</strong></div>{Number(order.discount)>0&&<div><span>Coupon{order.coupon_code ? ` · ${order.coupon_code}` : ''}</span><strong>−{money(Number(order.discount),order.currency)}</strong></div>}<hr/><div className="order-total"><span>Total</span><strong>{money(Number(order.total),order.currency)}</strong></div><div className="order-note"><b>Payment status</b><p>{order.status==='pending_payment' ? 'Payment is not collected yet. Secure checkout will be connected after verification.' : order.status==='paid' ? 'Payment has been confirmed for this order.' : 'Payment status follows the current order lifecycle.'}</p></div>
          {order.shipping_name&&<div className="order-note"><b>Delivery address</b><p><strong>{order.shipping_name}</strong><br/>{order.shipping_phone}<br/>{order.shipping_line1}{order.shipping_line2&&<><br/>{order.shipping_line2}</>}{order.shipping_landmark&&<><br/>Near {order.shipping_landmark}</>}<br/>{order.shipping_city}, {order.shipping_state} — {order.shipping_pincode}</p></div>}
          <Link href="/products" className="btn dark">Continue shopping</Link></aside>
      </div>
    </div>
  </main>;
}
