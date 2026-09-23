import DodoPayments from 'dodopayments';

export function dodoClient() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  if (!apiKey) return null;
  return new DodoPayments({ bearerToken: apiKey, environment: (process.env.DODO_PAYMENTS_ENVIRONMENT || 'test_mode') as any });
}
