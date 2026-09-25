'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function ProfileForm({ userId, initialName, initialPhone }: { userId:string; initialName:string; initialPhone:string }) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, full_name: name.trim() || null, phone: phone.trim() || null }, { onConflict: 'id' });
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage('Profile saved.');
    } catch {
      setMessage('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return <form className="profile-form" onSubmit={save}>
    <label>Full name<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" maxLength={120}/></label>
    <label>Phone<input value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" inputMode="tel" maxLength={30}/></label>
    {message && <p className="profile-message" role="status">{message}</p>}
    <button className="btn dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
  </form>;
}