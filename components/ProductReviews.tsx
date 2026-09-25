'use client';

import { Star } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';

type Review = { id:string; rating:number; title:string|null; body:string|null; created_at:string };

export function ProductReviews({ productId, reviews }: { productId:string; reviews:Review[] }) {
  const [eligibility, setEligibility] = useState<{eligible:boolean; orderId:string|null; review:Review|null}>({eligible:false,orderId:null,review:null});
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const average = useMemo(() => reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0, [reviews]);
  const stars = (value:number) => Array.from({length:5},(_,index)=><Star key={index} size={14} weight={index < value ? 'fill' : 'regular'} />);

  useEffect(() => {
    fetch('/api/reviews?productId=' + encodeURIComponent(productId), { cache:'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data) { setEligibility(data); if (data.review) { setRating(data.review.rating); setTitle(data.review.title || ''); setBody(data.review.body || ''); } } })
      .catch(() => {});
  }, [productId]);

  async function submit(event:React.FormEvent) {
    event.preventDefault();
    if (!eligibility.orderId || saving) return;
    setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/reviews', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({productId,orderId:eligibility.orderId,rating,title,body}) });
      const data = await response.json();
      if (response.status === 401) { window.location.href='/auth/login?next=' + encodeURIComponent(window.location.pathname); return; }
      if (!response.ok) throw new Error(data.error || 'Unable to save your review.');
      setEligibility((current) => ({...current, review:data.review}));
      setMessage('Your review is saved. Thank you for sharing.'); 
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save your review.'); }
    finally { setSaving(false); }
  }

  return <section className="reviews-section">
    <div className="reviews-heading">
      <div><span className="eyebrow dark">REVIEWS</span><h2>Worn & reviewed</h2></div>
      <div className="review-summary">{reviews.length ? <><strong>{average.toFixed(1)}</strong><span className="review-stars">{stars(Math.round(average))}</span><small>{reviews.length} review{reviews.length===1?'':'s'}</small></> : <small>No reviews yet</small>}</div>
    </div>
    <div className="reviews-layout">
      <div className="reviews-list">
        {reviews.length ? reviews.map((review)=><article className="review-card" key={review.id}><div className="review-card-top"><span className="review-stars">{stars(review.rating)}</span><span>Verified buyer</span></div>{review.title&&<h3>{review.title}</h3>}{review.body&&<p>{review.body}</p>}</article>) : <div className="reviews-empty"><p>Be the first to share how this piece feels, fits and wears.</p></div>}
      </div>
      <div className="review-form-card">
        {eligibility.eligible ? <form onSubmit={submit}><span className="eyebrow dark">{eligibility.review ? 'YOUR REVIEW' : 'VERIFIED BUYER'}</span><h3>{eligibility.review ? 'Update your review' : 'Tell us about it'}</h3><div className="rating-picker" aria-label="Rating">{[1,2,3,4,5].map((value)=><button type="button" key={value} className={value <= rating ? 'active':''} onClick={()=>setRating(value)} aria-label={value+' star'+(value>1?'s':'')}><Star size={23} weight={value <= rating ? 'fill':'regular'}/></button>)}</div><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Review title (optional)" maxLength={100}/><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="How did it fit, feel or wear?" maxLength={1000} rows={5}/><button className="btn dark" disabled={saving}>{saving ? 'Saving…' : 'Save review →'}</button>{message&&<p className="review-message">{message}</p>}</form> : <div><span className="eyebrow dark">VERIFIED REVIEWS</span><h3>Review after delivery</h3><p>Once your Z-Clothes order is marked delivered, you can leave a rating and review here.</p><a className="btn light" href="/account/orders">View orders</a></div>}
      </div>
    </div>
  </section>;
}
