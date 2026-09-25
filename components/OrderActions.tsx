'use client';

import { useEffect, useState } from 'react';
import { X } from '@phosphor-icons/react';

type Props={orderId:string;status:string};

const reasons=[
  ['size_fit','Size / fit issue'],
  ['damaged','Damaged on arrival'],
  ['wrong_item','Wrong item received'],
  ['quality','Quality issue'],
  ['changed_mind','Changed my mind'],
  ['other','Other'],
] as const;

export default function OrderActions({orderId,status}:Props){
  const [canceling,setCanceling]=useState(false);
  const [showReturn,setShowReturn]=useState(false);
  const [reason,setReason]=useState('');
  const [details,setDetails]=useState('');
  const [submitting,setSubmitting]=useState(false);
  const [message,setMessage]=useState('');
  const [existing,setExisting]=useState<{status:string}|null>(null);

  useEffect(()=>{
    if(status!=='delivered') return;
    fetch('/api/returns?orderId='+encodeURIComponent(orderId)).then(r=>r.ok?r.json():null).then(d=>{if(d?.request)setExisting(d.request)}).catch(()=>{});
  },[orderId,status]);

  async function cancelOrder(){
    if(canceling)return;
    if(!window.confirm('Cancel this order? This cannot be undone.'))return;
    setCanceling(true);setMessage('');
    try{
      const r=await fetch('/api/orders/'+orderId+'/cancel',{method:'POST'});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Unable to cancel this order.');
      window.location.reload();
    }catch(e){setMessage(e instanceof Error?e.message:'Unable to cancel this order.');setCanceling(false)}
  }

  async function submitReturn(e:React.FormEvent){
    e.preventDefault();
    if(!reason||submitting)return;
    setSubmitting(true);setMessage('');
    try{
      const r=await fetch('/api/returns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId,reason,details})});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Unable to submit return request.');
      setExisting(d.request);setShowReturn(false);setMessage('Return request submitted. We’ll review it and update your order.');
    }catch(e){setMessage(e instanceof Error?e.message:'Unable to submit return request.');}
    finally{setSubmitting(false)}
  }

  const canCancel=['draft','pending_payment','paid','processing'].includes(status);
  if(!canCancel&&status!=='delivered'&&!message)return null;

  return <div className="order-actions">
    <div className="order-actions-row">
      {canCancel&&<button className="btn outline" type="button" onClick={cancelOrder} disabled={canceling}>{canceling?'Cancelling…':'Cancel order'}</button>}
      {status==='delivered'&&(!existing||existing.status==='rejected')&&<button className="btn dark" type="button" onClick={()=>{setShowReturn(true);setMessage('')}}>Request return</button>}
      {status==='delivered'&&existing&&existing.status!=='rejected'&&<span className="return-status">Return request · {existing.status}</span>}
    </div>
    {message&&<p className="order-action-message">{message}</p>}
    {showReturn&&<div className="return-overlay" role="dialog" aria-modal="true" aria-label="Request a return">
      <div className="return-modal">
        <button className="return-close" type="button" aria-label="Close" onClick={()=>setShowReturn(false)}><X size={18}/></button>
        <span className="eyebrow dark">RETURN REQUEST</span><h2>Tell us what happened.</h2><p>Returns are available after delivery. Your request will be reviewed before any return or refund is arranged.</p>
        <form onSubmit={submitReturn}>
          <label>Reason<select value={reason} onChange={e=>setReason(e.target.value)} required><option value="">Choose a reason</option>{reasons.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
          <label>Details <span>(optional)</span><textarea value={details} onChange={e=>setDetails(e.target.value)} maxLength={1000} rows={5} placeholder="Add a little context…" /></label>
          <button className="btn dark" type="submit" disabled={submitting}>{submitting?'Submitting…':'Submit return request'}</button>
        </form>
      </div>
    </div>}
  </div>
}
