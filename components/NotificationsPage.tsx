'use client';

import Link from 'next/link';
import { CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { useState } from 'react';

type Notification={id:string;type:string;title:string;body:string;order_id:string|null;read_at:string|null;created_at:string};

function date(value:string){
  return new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
}

export default function NotificationsPage({initial}:{initial:Notification[]}){
  const [items,setItems]=useState(initial);
  const unread=items.filter(x=>!x.read_at).length;

  async function mark(id:string){
    setItems(x=>x.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n));
    await fetch('/api/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
  }

  async function markAll(){
    setItems(x=>x.map(n=>({...n,read_at:n.read_at||new Date().toISOString()})));
    await fetch('/api/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({all:true})});
  }

  return <section className="notifications-page-content">
    <div className="notifications-page-toolbar">
      <div><span className="eyebrow dark">YOUR UPDATES</span><h2>All notifications.</h2><p>{unread ? String(unread)+' unread update'+(unread===1?'':'s')+' waiting for you.' : 'You’re all caught up.'}</p></div>
      {unread>0&&<button className="btn light" type="button" onClick={markAll}><CheckCircle size={16}/> Mark all as read</button>}
    </div>

    {!items.length
      ? <div className="notifications-page-empty"><BellIcon/><h3>You’re all caught up.</h3><p>Order updates, cancellations and return activity will appear here.</p><Link href="/products" className="btn dark">Browse collection <ArrowRight size={15}/></Link></div>
      : <div className="notifications-page-list">{items.map(n=><article className={'notification-page-item '+(n.read_at?'':'unread')} key={n.id}>
          <div className="notification-page-copy">
            <div className="notification-page-title"><span className="notification-type">{n.type.replaceAll('_',' ')}</span>{!n.read_at&&<i aria-label="Unread"/>}</div>
            <h3>{n.title}</h3>
            <p>{n.body}</p>
            <small>{date(n.created_at)}</small>
          </div>
          <div className="notification-page-action">
            {n.order_id&&<Link href={'/account/orders/'+n.order_id} onClick={()=>mark(n.id)}>View order <ArrowRight size={14}/></Link>}
            {!n.read_at&&<button type="button" onClick={()=>mark(n.id)}>Mark read</button>}
          </div>
        </article>)}</div>}
  </section>;
}

function BellIcon(){
 return <div className="notifications-empty-icon" aria-hidden="true">Z</div>;
}
