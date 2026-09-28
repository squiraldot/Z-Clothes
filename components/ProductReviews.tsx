'use client';

import { Star } from '@phosphor-icons/react';
import { useEffect, useMemo, useState } from 'react';
import { buildReviewSummary, filterAndSortReviews, getReviewSortOptions, type ReviewRecord, type ReviewRatingFilter, type ReviewSort } from '@/lib/review-experience';

export function ProductReviews({ productId, reviews }: { productId: string; reviews: ReviewRecord[] }) {
  const [eligibility, setEligibility] = useState<{ eligible: boolean; orderId: string | null; review: ReviewRecord | null }>({ eligible: false, orderId: null, review: null });
  const [rating, setRating] = useState(5); const [title, setTitle] = useState(''); const [body, setBody] = useState('');
  const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<ReviewRatingFilter>('all'); const [sort, setSort] = useState<ReviewSort>('recent');
  const summary = useMemo(() => buildReviewSummary(reviews), [reviews]);
  const visibleReviews = useMemo(() => filterAndSortReviews(reviews, { rating: ratingFilter, sort }), [reviews, ratingFilter, sort]);
  const stars = (value: number) => Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} weight={index < value ? 'fill' : 'regular'} />);

  useEffect(() => {
    fetch('/api/reviews?productId=' + encodeURIComponent(productId), { cache: 'no-store' }).then((response) => response.ok ? response.json() : null).then((data) => {
      if (data) { setEligibility(data); if (data.review) { setRating(data.review.rating); setTitle(data.review.title || ''); setBody(data.review.body || ''); } }
    }).catch(() => {});
  }, [productId]);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!eligibility.orderId || saving) return; setSaving(true); setMessage('');
    try {
      const response = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, orderId: eligibility.orderId, rating, title, body }) });
      const data = await response.json(); if (response.status === 401) { window.location.href = '/auth/login?next=' + encodeURIComponent(window.location.pathname); return; }
      if (!response.ok) throw new Error(data.error || 'Unable to save your review.');
      setEligibility((current) => ({ ...current, review: data.review })); setMessage('Your review is saved. Thank you for sharing.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save your review.'); } finally { setSaving(false); }
  }

  return <section className="reviews-section">
    <div className="reviews-heading"><div><span className="eyebrow dark">REVIEWS</span><h2>Worn & reviewed</h2></div>{summary.count ? <div className="review-summary"><strong>{summary.average.toFixed(1)}</strong><span className="review-stars">{stars(Math.round(summary.average))}</span><small>{summary.count} review{summary.count === 1 ? '' : 's'}</small></div> : <small>No reviews yet</small>}</div>
    {summary.count > 0 && <div className="review-controls">
      <div className="review-distribution" aria-label="Rating distribution">{[5,4,3,2,1].map((value) => { const count = summary.distribution[value as 1|2|3|4|5]; const width = (count / summary.count) * 100; return <button type="button" key={value} className={ratingFilter === value ? 'review-rating-row active' : 'review-rating-row'} onClick={() => setRatingFilter(ratingFilter === value ? 'all' : value as ReviewRatingFilter)} aria-label={`${value} star reviews: ${count}`} aria-pressed={ratingFilter === value}><span>{value} <Star size={11} weight="fill" /></span><span className="review-rating-track"><i style={{ width: `${width}%` }} /></span><small>{count}</small></button>; })}</div>
      <label className="review-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as ReviewSort)}>{getReviewSortOptions().map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    </div>}
    <div className="reviews-layout">
      <div className="reviews-list">{visibleReviews.length ? visibleReviews.map((review) => <article className="review-card" key={review.id}><div className="review-card-top"><span className="review-stars">{stars(review.rating)}</span><span>Verified buyer</span></div>{review.title && <h3>{review.title}</h3>}{review.body && <p>{review.body}</p>}<small className="review-date">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></article>) : <div className="reviews-empty"><p>No reviews match this rating.</p><button type="button" className="btn light" onClick={() => setRatingFilter('all')}>Show all reviews</button></div>}</div>
      <div className="review-form-card">{eligibility.eligible ? <form onSubmit={submit}><span className="eyebrow dark">{eligibility.review ? 'YOUR REVIEW' : 'VERIFIED BUYER'}</span><h3>{eligibility.review ? 'Update your review' : 'Tell us about it'}</h3><div className="rating-picker" aria-label="Rating">{[1,2,3,4,5].map((value) => <button type="button" key={value} className={value <= rating ? 'active' : ''} onClick={() => setRating(value)} aria-label={value + ' star' + (value > 1 ? 's' : '')}><Star size={23} weight={value <= rating ? 'fill' : 'regular'} /></button>)}</div><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Review title (optional)" maxLength={100}/><textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="How did it fit, feel or wear?" maxLength={1000} rows={5}/><div className="review-form-meta"><span>{body.length}/1000</span><span>Verified purchase only</span></div><button className="btn dark" disabled={saving}>{saving ? 'Saving…' : 'Save review →'}</button>{message && <p className="review-message" role="status">{message}</p>}</form> : <div><span className="eyebrow dark">VERIFIED REVIEWS</span><h3>Review after delivery</h3><p>Once your Z-Clothes order is marked delivered, you can leave a rating and review here.</p><a className="btn light" href="/account/orders">View orders</a></div>}</div>
    </div>
  </section>;
}
