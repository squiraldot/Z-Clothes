'use client';

import { Check, MapPin, Plus, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import styles from './CheckoutAddressPicker.module.css';

type Address={id:string;full_name:string;phone:string;line1:string;line2:string|null;landmark:string|null;city:string;state:string;pincode:string;is_default:boolean};
type Props={value:string;onChange:(id:string)=>void};

export default function CheckoutAddressPicker({value,onChange}:Props){
 const [addresses,setAddresses]=useState<Address[]>([]);
 const [loading,setLoading]=useState(true);
 const [open,setOpen]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const [form,setForm]=useState({fullName:'',phone:'',line1:'',line2:'',landmark:'',city:'',state:'',pincode:'',isDefault:true});
 async function load(){
  setLoading(true); const r=await fetch('/api/addresses',{cache:'no-store'}); const data=await r.json();
  if(r.status===401){window.location.href='/auth/login?next=/checkout';return;}
  if(!r.ok){setError(data.error||'Unable to load addresses.');setLoading(false);return;}
  const list=data.addresses??[]; setAddresses(list);
  if(!value && list[0]) onChange(list.find((a:Address)=>a.is_default)?.id||list[0].id);
  setLoading(false);
 }
 useEffect(()=>{load();},[]);
 async function save(e:React.FormEvent){
  e.preventDefault();setSaving(true);setError('');
  try{
   const r=await fetch('/api/addresses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
   const data=await r.json();if(!r.ok)throw new Error(data.error||'Unable to save address.');
   setOpen(false);
   const list=await fetch('/api/addresses',{cache:'no-store'}).then(x=>x.json());
   setAddresses(list.addresses??[]);onChange(data.address.id);
  }catch(e){setError(e instanceof Error?e.message:'Unable to save address.');}
  finally{setSaving(false);}
 }
 return <section className={styles.wrap}>
   <div className={styles.head}><div><span className="eyebrow dark">DELIVERY ADDRESS</span><h2>Where should we send it?</h2></div><button className="btn light" type="button" onClick={()=>setOpen(true)}><Plus size={14}/> Add new</button></div>
   {loading?<p className={styles.muted}>Loading saved addresses…</p>
   :!addresses.length?<div className={styles.empty}><MapPin size={25}/><p>Add a delivery address to continue.</p><button className="btn dark" type="button" onClick={()=>setOpen(true)}>Add address</button></div>
   :<div className={styles.list}>{addresses.map(a=><button type="button" className={a.id===value?styles.selected:styles.card} key={a.id} onClick={()=>onChange(a.id)}>
     <span className={styles.radio}>{a.id===value&&<Check size={12}/>}</span><span className={styles.content}><strong>{a.full_name}{a.is_default&&<em>Default</em>}</strong><span>{a.phone}</span><span>{a.line1}{a.line2?', '+a.line2:''}, {a.city}, {a.state} — {a.pincode}</span></span>
   </button>)}</div>}
   {error&&!open&&<p className={styles.error}>{error}</p>}
   {open&&<div className={styles.overlay} onMouseDown={()=>!saving&&setOpen(false)}><form className={styles.modal} onSubmit={save} onMouseDown={e=>e.stopPropagation()}>
     <div className={styles.modalHead}><div><span className="eyebrow dark">NEW ADDRESS</span><h3>Add delivery address</h3></div><button type="button" onClick={()=>setOpen(false)}><X size={18}/></button></div>
     <div className={styles.form}>
       {([['fullName','Full name'],['phone','Phone'],['line1','Address line'],['line2','Apartment / area (optional)'],['landmark','Landmark (optional)'],['city','City'],['state','State'],['pincode','Pincode']] as [keyof typeof form,string][]).map(([key,label])=><label key={key} className={key==='line1'||key==='line2'||key==='landmark'?styles.full:''}><span>{label}</span><input value={String(form[key])} onChange={e=>setForm({...form,[key]:e.target.value})} required={key!=='line2'&&key!=='landmark'} maxLength={key==='pincode'?6:120}/></label>)}
     </div>
     {error&&<p className={styles.error}>{error}</p>}
     <div className={styles.actions}><button type="button" className="btn light" onClick={()=>setOpen(false)}>Cancel</button><button className="btn dark" disabled={saving}>{saving?'Saving…':'Save address'}</button></div>
   </form></div>}
 </section>;
}
