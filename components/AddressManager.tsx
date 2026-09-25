'use client';

import Link from 'next/link';
import { ArrowLeft, Check, MapPin, PencilSimple, Plus, Trash, X } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import styles from './AddressManager.module.css';

type Address = {
  id:string; full_name:string; phone:string; line1:string; line2:string|null; landmark:string|null;
  city:string; state:string; pincode:string; is_default:boolean;
};
type FormState = {
  fullName:string; phone:string; line1:string; line2:string; landmark:string; city:string; state:string; pincode:string; isDefault:boolean;
};
const empty:FormState={fullName:'',phone:'',line1:'',line2:'',landmark:'',city:'',state:'',pincode:'',isDefault:false};

function toForm(a:Address):FormState {
  return {fullName:a.full_name,phone:a.phone,line1:a.line1,line2:a.line2??'',landmark:a.landmark??'',city:a.city,state:a.state,pincode:a.pincode,isDefault:a.is_default};
}

export default function AddressManager() {
  const [addresses,setAddresses]=useState<Address[]>([]);
  const [form,setForm]=useState<FormState>(empty);
  const [editing,setEditing]=useState<string|null>(null);
  const [open,setOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  async function load() {
    setLoading(true);
    const r=await fetch('/api/addresses',{cache:'no-store'});
    const data=await r.json();
    if(r.status===401){window.location.href='/auth/login?next=/account/addresses';return;}
    if(!r.ok){setError(data.error||'Unable to load addresses.');setLoading(false);return;}
    setAddresses(data.addresses??[]);setLoading(false);
  }
  useEffect(()=>{load();},[]);

  function startNew(){setEditing(null);setForm({...empty,isDefault:addresses.length===0});setError('');setMessage('');setOpen(true)}
  function startEdit(a:Address){setEditing(a.id);setForm(toForm(a));setError('');setMessage('');setOpen(true)}
  function close(){if(!saving){setOpen(false);setError('');}}
  function update(key:keyof FormState,value:string|boolean){setForm(prev=>({...prev,[key]:value}))}

  async function save(e:React.FormEvent) {
    e.preventDefault(); setSaving(true); setError(''); setMessage('');
    const endpoint=editing?'/api/addresses/'+editing:'/api/addresses';
    const method=editing?'PATCH':'POST';
    try {
      const r=await fetch(endpoint,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||'Unable to save address.');
      setOpen(false); setMessage(editing?'Address updated.':'Address saved.'); await load();
    } catch(e){setError(e instanceof Error?e.message:'Unable to save address.');}
    finally{setSaving(false);}
  }

  async function remove(a:Address) {
    if(!window.confirm('Delete this saved address?')) return;
    setError(''); setMessage('');
    const r=await fetch('/api/addresses/'+a.id,{method:'DELETE'});
    const data=await r.json();
    if(!r.ok){setError(data.error||'Unable to delete address.');return;}
    setMessage('Address deleted.'); await load();
  }

  return <div className={styles.wrap}>
    <div className={styles.top}>
      <Link href="/account" className={styles.back}><ArrowLeft size={14}/> Account</Link>
      <div className={styles.headingRow}>
        <div><span className="eyebrow dark">DELIVERY</span><h1>Saved addresses.</h1><p>Keep your delivery details ready for faster checkout.</p></div>
        <button className="btn dark" onClick={startNew}><Plus size={15}/> Add address</button>
      </div>
    </div>

    {message&&<p className={styles.message}>{message}</p>}
    {error&&!open&&<p className={styles.error}>{error}</p>}

    {loading?<div className={styles.empty}><MapPin size={32}/><p>Loading your addresses…</p></div>
    :!addresses.length?<div className={styles.empty}><MapPin size={34}/><h2>No saved addresses.</h2><p>Add your first delivery address and it will be ready at checkout.</p><button className="btn dark" onClick={startNew}>Add your first address</button></div>
    :<div className={styles.grid}>{addresses.map(a=><article className={styles.card} key={a.id}>
      <div className={styles.cardHead}><div><span className={styles.tag}>{a.is_default?'DEFAULT':'SAVED'}</span><h2>{a.full_name}</h2></div><MapPin size={20}/></div>
      <p className={styles.phone}>{a.phone}</p>
      <p className={styles.address}>{a.line1}{a.line2&&<><br/>{a.line2}</>}{a.landmark&&<><br/>Near {a.landmark}</>}<br/>{a.city}, {a.state} — {a.pincode}</p>
      <div className={styles.actions}><button onClick={()=>startEdit(a)}><PencilSimple size={14}/> Edit</button><button onClick={()=>remove(a)}><Trash size={14}/> Delete</button></div>
    </article>)}</div>}

    {open&&<div className={styles.overlay} role="dialog" aria-modal="true" onMouseDown={close}>
      <form className={styles.modal} onSubmit={save} onMouseDown={e=>e.stopPropagation()}>
        <div className={styles.modalHead}><div><span className="eyebrow dark">{editing?'EDIT ADDRESS':'NEW ADDRESS'}</span><h2>{editing?'Update delivery details':'Where should we deliver?'}</h2></div><button type="button" onClick={close} aria-label="Close"><X size={20}/></button></div>
        <div className={styles.formGrid}>
          {([['fullName','Full name'],['phone','Phone'],['line1','Address line'],['line2','Apartment / area (optional)'],['landmark','Landmark (optional)'],['city','City'],['state','State'],['pincode','Pincode']] as [keyof FormState,string][]).map(([key,label])=><label key={key} className={key==='line1'||key==='line2'||key==='landmark'?styles.full:''}><span>{label}</span><input value={String(form[key])} onChange={e=>update(key,e.target.value)} maxLength={key==='pincode'?6:120} inputMode={key==='phone'||key==='pincode'?'tel':'text'} required={key!=='line2'&&key!=='landmark'} /></label>)}
        </div>
        <label className={styles.default}><input type="checkbox" checked={form.isDefault} onChange={e=>update('isDefault',e.target.checked)}/><span>Use as my default delivery address <Check size={14}/></span></label>
        {error&&<p className={styles.error}>{error}</p>}
        <div className={styles.modalActions}><button type="button" className="btn light" onClick={close}>Cancel</button><button type="submit" className="btn dark" disabled={saving}>{saving?'Saving…':editing?'Save changes':'Save address'}</button></div>
      </form>
    </div>}
  </div>;
}
