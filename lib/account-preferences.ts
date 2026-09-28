export type EmailFrequency = 'all' | 'weekly' | 'monthly' | 'off';

export type AccountPreferences = {
  emailFrequency: EmailFrequency;
  newArrivals: boolean;
  offers: boolean;
  styleEdits: boolean;
  personalizedRecommendations: boolean;
};

export const DEFAULT_ACCOUNT_PREFERENCES: AccountPreferences = {
  emailFrequency: 'weekly',
  newArrivals: true,
  offers: true,
  styleEdits: false,
  personalizedRecommendations: true,
};

const EMAIL_FREQUENCIES: EmailFrequency[] = ['all', 'weekly', 'monthly', 'off'];

function booleanOrDefault(value: unknown, fallback: boolean) {
  return typeof value === 'boolean' ? value : fallback;
}

export function normalizeAccountPreferences(value: Partial<Record<keyof AccountPreferences, unknown>> | null | undefined): AccountPreferences {
  const frequency = value?.emailFrequency;
  return {
    emailFrequency: typeof frequency === 'string' && EMAIL_FREQUENCIES.includes(frequency as EmailFrequency)
      ? frequency as EmailFrequency
      : DEFAULT_ACCOUNT_PREFERENCES.emailFrequency,
    newArrivals: booleanOrDefault(value?.newArrivals, DEFAULT_ACCOUNT_PREFERENCES.newArrivals),
    offers: booleanOrDefault(value?.offers, DEFAULT_ACCOUNT_PREFERENCES.offers),
    styleEdits: booleanOrDefault(value?.styleEdits, DEFAULT_ACCOUNT_PREFERENCES.styleEdits),
    personalizedRecommendations: booleanOrDefault(
      value?.personalizedRecommendations,
      DEFAULT_ACCOUNT_PREFERENCES.personalizedRecommendations,
    ),
  };
}
