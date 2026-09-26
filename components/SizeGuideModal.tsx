'use client';

import { useEffect } from 'react';

const rows = [
  ['S','38–40"','27"'],['M','40–42"','28"'],['L','42–44"','29"'],['XL','44–46"','30"'],['XXL','46–48"','31"'],
];

export function SizeGuideModal({ open, onClose }: { open:boolean; onClose:()=>void }) {
  useEffect(() => {
    if (!open) return;
    const handler=(event:KeyboardEvent)=>{ if(event.key==='Escape') onClose(); };
    window.addEventListener('keydown',handler);
    return()=>window.removeEventListener('keydown',handler);
  },[open,onClose]);
  if(!open)return null;
  return <div className="size-guide-modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-title" onClick={onClose}>
    <div className="size-guide-card" onClick={(event)=>event.stopPropagation()}>
      <button type="button" className="size-guide-close" onClick={onClose} aria-label="Close size guide">×</button>
      <span className="eyebrow dark">FIND YOUR FIT</span>
      <h2 id="size-guide-title">Size Guide</h2>
      <p>Measure around the fullest part of your chest. Measurements are approximate and can vary by fit.</p>
      <div className="size-guide-table"><div>Size</div><div>Chest</div><div>Length</div>{rows.flatMap(row=>row.map((cell,index)=><div key={row[0]+'-'+index}>{cell}</div>))}</div>
      <p className="size-guide-note">For oversized styles, choose your usual size for a relaxed fit or size down for a closer silhouette.</p>
    </div>
  </div>;
}
