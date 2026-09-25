'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const statuses=['draft','pending_payment','paid','processing','shipped','delivered','cancelled','refunded'];

export default function AdminOrderStatus({orderId,status}:{orderId:string;status:string}){
  const router=useRouter();
  const [value,setValue]=useState(status);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');

  async function update(next:string){
    if(next===value) return;
    setSaving(true); setError('');
    try{
      const response=await fetch('/api/admin/orders/'+orderId,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Unable to update order.');
      setValue(data.status);
      router.refresh();
    }catch(e){setError(e instanceof Error?e.message:'Unable to update order.');}
    finally{setSaving(false);}
  }

  return <div className="admin-status">
    <select value={value} disabled={saving} onChange={e=>update(e.target.value)} aria-label="Order status">
      {statuses.map(item=><option key={item} value={item}>{item.replaceAll('_',' ').replace(/\b\w/g,m=>m.toUpperCase())}</option>)}
    </select>
    {error&&<small>{error}</small>}
  </div>;
}
