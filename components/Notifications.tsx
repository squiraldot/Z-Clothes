'use client';
import Link from 'next/link';
import { Bell, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

type Notification={id:string;type:string;title:string;body:string;order_id:string|null;read_at:string|null;created_at:string};

export default function Notifications(){
 const [items,setItems]=useState<Notification[]>([]);
 const [open,setOpen]=useState(false);
 const [loading,setLoading]=useState(false);
 async function load(){
  setLoading(true);
  try{const r=await fetch('/api/notifications',{cache:'no-store'});const d=await r.json();if(r.ok)setItems(d.notifications||[])}finally{setLoading(false)}
 }
 useEffect(()=>{load();const t=window.setInterval(load,30000);return()=>window.clearInterval(t)},[]);
 const unread=items.filter(x=>!x.read_at).length;
 async function mark(id:string){setItems(x=>x.map(n=>n.id===id?{...n,read_at:new Date().toISOString()}:n));await fetch('/api/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})}
 async function markAll(){setItems(x=>x.map(n=>({...n,read_at:n.read_at||new Date().toISOString()})));await fetch('/api/notifications',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({all:true})})}
 return <div className="notifications-wrap">
  <button className="notification-trigger" type="button" aria-label={unread?unread+' unread notifications':'Notifications'} onClick={()=>{setOpen(!open);if(!open)load()}}><Bell size={18}/>{unread>0&&<span className="notification-count">{unread>9?'9+':unread}</span>}</button>
  {open&&<><button className="notification-backdrop" aria-label="Close notifications" onClick={()=>setOpen(false)}/><aside className="notification-panel">
   <div className="notification-head"><div><span className="eyebrow dark">YOUR UPDATES</span><h2>Notifications</h2></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close"><X size={18}/></button></div>
   {unread>0&&<button className="notification-read-all" onClick={markAll}>Mark all as read</button>}
   <div className="notification-list">{loading&&!items.length?<p className="notification-empty">Loading…</p>:!items.length?<p className="notification-empty">You’re all caught up.</p>:items.map(n=><div className={`notification-item ${n.read_at?'':'unread'}`} key={n.id} onClick={()=>!n.read_at&&mark(n.id)}>
     <div><b>{n.title}</b><p>{n.body}</p><small>{new Intl.DateTimeFormat('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(n.created_at))}</small></div>
     {n.order_id&&<Link href={'/account/orders/'+n.order_id} onClick={()=>{mark(n.id);setOpen(false)}}>View</Link>}
   </div>)}</div>
  </aside></>}
 </div>
}
