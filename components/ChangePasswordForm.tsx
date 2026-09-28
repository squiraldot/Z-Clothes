'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        current_password: currentPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setCurrentPassword('');
      setPassword('');
      setConfirmPassword('');
      setMessage('Password changed successfully.');
    } catch {
      setError('Could not change your password. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="password-form" onSubmit={save}>
      <div className="password-form-head">
        <div>
          <span className="eyebrow dark">SECURITY</span>
          <h3>Change password.</h3>
        </div>
        <span className="password-form-note">Keep your account secure.</span>
      </div>

      <label>
        Current password
        <input
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          minLength={6}
          required
        />
      </label>

      <label>
        New password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </label>

      <label>
        Confirm new password
        <input
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />
      </label>

      {error && <p className="profile-message" role="alert">{error}</p>}
      {message && <p className="profile-message" role="status">{message}</p>}

      <button className="btn dark" type="submit" disabled={saving}>
        {saving ? 'Changing…' : 'Change password'}
      </button>
    </form>
  );
}
