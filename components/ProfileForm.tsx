'use client';

import { useState } from 'react';
import { PencilSimple, X } from '@phosphor-icons/react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type Props = { userId: string; initialName: string; initialPhone: string; initialAvatarUrl: string };

export function ProfileForm({ userId, initialName, initialPhone, initialAvatarUrl }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState(initialAvatarUrl);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function cancel() { setName(initialName); setPhone(initialPhone); setAvatarFile(null); setPreview(avatarUrl); setMessage(''); setEditing(false); }

  function chooseAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage('Please choose an image file.'); return; }
    if (file.size > 3 * 1024 * 1024) { setMessage('Avatar must be 3MB or smaller.'); return; }
    setAvatarFile(file); setPreview(URL.createObjectURL(file)); setMessage('');
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage('');
    try {
      const supabase = createSupabaseBrowserClient();
      let nextAvatarUrl = avatarUrl;
      if (avatarFile) {
        const extension = avatarFile.type.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg';
        const path = userId + '/avatar-' + Date.now() + '.' + extension;
        const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { cacheControl: '3600', upsert: false, contentType: avatarFile.type });
        if (uploadError) { setMessage(uploadError.message); return; }
        nextAvatarUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from('profiles').upsert({ id: userId, full_name: name.trim() || null, phone: phone.trim() || null, avatar_url: nextAvatarUrl || null }, { onConflict: 'id' });
      if (error) { setMessage(error.message); return; }
      setAvatarUrl(nextAvatarUrl); setAvatarFile(null); setPreview(nextAvatarUrl); setMessage('Profile saved.'); setEditing(false);
    } catch { setMessage('Could not save your profile. Please try again.'); }
    finally { setSaving(false); }
  }

  if (!editing) return <div className="profile-view">
    <div className="profile-view-top">
      <div className="profile-avatar">{avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{(name || 'Z').slice(0, 1).toUpperCase()}</span>}</div>
      <button className="icon-btn profile-edit-btn" type="button" onClick={() => setEditing(true)} aria-label="Edit profile" title="Edit profile"><PencilSimple size={18} /></button>
    </div>
    <div className="profile-view-details">
      <div><span>Full name</span><strong>{name || 'Not added yet'}</strong></div>
      <div><span>Phone</span><strong>{phone || 'Not added yet'}</strong></div>
    </div>
    {message && <p className="profile-message" role="status">{message}</p>}
  </div>;

  return <form className="profile-form" onSubmit={save}>
    <div className="profile-editor-head">
      <div className="profile-avatar large">{preview ? <img src={preview} alt="Profile preview" /> : <span>{(name || 'Z').slice(0, 1).toUpperCase()}</span>}</div>
      <label className="avatar-picker">Change photo<input type="file" accept="image/*" onChange={chooseAvatar} /></label>
    </div>
    <label>Full name<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" maxLength={120}/></label>
    <label>Phone<input value={phone} onChange={e=>setPhone(e.target.value)} autoComplete="tel" inputMode="tel" maxLength={30}/></label>
    {message && <p className="profile-message" role={message === 'Profile saved.' ? 'status' : 'alert'}>{message}</p>}
    <div className="profile-form-actions"><button className="btn dark" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button><button className="btn light" type="button" onClick={cancel} disabled={saving}><X size={15}/> Cancel</button></div>
  </form>;
}
