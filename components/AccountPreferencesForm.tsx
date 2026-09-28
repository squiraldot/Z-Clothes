'use client';

import { useState } from 'react';
import { Check, FloppyDisk } from '@phosphor-icons/react';
import { normalizeAccountPreferences, type AccountPreferences, type EmailFrequency } from '@/lib/account-preferences';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import styles from './AccountPreferencesForm.module.css';

type Props = { userId: string; initialPreferences: Partial<Record<keyof AccountPreferences, unknown>> | null };

const frequencyOptions: Array<{ value: EmailFrequency; label: string; description: string }> = [
  { value: 'all', label: 'All updates', description: 'New drops, offers and style edits as they happen.' },
  { value: 'weekly', label: 'Weekly', description: 'A single weekly digest instead of frequent emails.' },
  { value: 'monthly', label: 'Monthly', description: 'A lighter monthly roundup of Z-Clothes updates.' },
  { value: 'off', label: 'No marketing email', description: 'Keep operational order and account emails only.' },
];

const topics: Array<{ key: keyof Pick<AccountPreferences, 'newArrivals' | 'offers' | 'styleEdits'>; title: string; description: string }> = [
  { key: 'newArrivals', title: 'New arrivals', description: 'New pieces, drops and collection launches.' },
  { key: 'offers', title: 'Offers & drops', description: 'Promotions, limited offers and sale updates.' },
  { key: 'styleEdits', title: 'Style edits', description: 'Curated outfit ideas and editorial picks.' },
];

export function AccountPreferencesForm({ userId, initialPreferences }: Props) {
  const initial = normalizeAccountPreferences(initialPreferences);
  const [preferences, setPreferences] = useState<AccountPreferences>(initial);
  const [savedPreferences, setSavedPreferences] = useState<AccountPreferences>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const dirty = JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  function toggle(key: keyof AccountPreferences) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
    setMessage('');
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    setSaving(true);
    setMessage('');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('account_preferences').upsert({
        user_id: userId,
        email_frequency: preferences.emailFrequency,
        new_arrivals: preferences.newArrivals,
        offers: preferences.offers,
        style_edits: preferences.styleEdits,
        personalized_recommendations: preferences.personalizedRecommendations,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) {
        setMessage(error.message);
        return;
      }
      setSavedPreferences(preferences);
      setMessage('Preferences saved.');
    } catch {
      setMessage('Could not save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={save}>
      <fieldset className={styles.fieldset}>
        <legend>Email frequency</legend>
        <p className={styles.intro}>Choose how often promotional emails should reach you. You can change this anytime.</p>
        <div className={styles.frequencyGrid}>
          {frequencyOptions.map((option) => (
            <label className={preferences.emailFrequency === option.value ? styles.choice + ' ' + styles.selected : styles.choice} key={option.value}>
              <input type="radio" name="email-frequency" value={option.value} checked={preferences.emailFrequency === option.value} onChange={() => setPreferences((current) => ({ ...current, emailFrequency: option.value }))} />
              <span className={styles.radio} aria-hidden="true" />
              <span><strong>{option.label}</strong><small>{option.description}</small></span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Email topics</legend>
        <p className={styles.intro}>Keep only the topics that are useful to you. Frequency still controls the overall cadence.</p>
        <div className={styles.topicList}>
          {topics.map((topic) => (
            <label className={styles.toggleRow} key={topic.key}>
              <span><strong>{topic.title}</strong><small>{topic.description}</small></span>
              <input type="checkbox" checked={preferences[topic.key]} onChange={() => toggle(topic.key)} aria-label={topic.title} />
              <span className={styles.switch} aria-hidden="true"><span /></span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend>Shopping experience</legend>
        <label className={styles.toggleRow}>
          <span><strong>Personalized recommendations</strong><small>Use your account activity to tailor future product suggestions.</small></span>
          <input type="checkbox" checked={preferences.personalizedRecommendations} onChange={() => toggle('personalizedRecommendations')} aria-label="Personalized recommendations" />
          <span className={styles.switch} aria-hidden="true"><span /></span>
        </label>
      </fieldset>

      <div className={styles.note}><Check size={16} /><span>Order, security and account-service messages are not controlled by marketing preferences.</span></div>
      {message && <p className={styles.message} role={message === 'Preferences saved.' ? 'status' : 'alert'}>{message}</p>}

      <div className={styles.actions}>
        <button className="btn dark" type="submit" disabled={saving || !dirty}><FloppyDisk size={15} />{saving ? 'Saving…' : 'Save preferences'}</button>
        <button className="btn light" type="button" onClick={() => { setPreferences(savedPreferences); setMessage(''); }} disabled={saving || !dirty}>Reset changes</button>
      </div>
    </form>
  );
}
