import { Webhooks } from '@dodopayments/nextjs';

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_KEY!,
  onPaymentSucceeded: async (payload: any) => {
    console.log('Dodo payment succeeded', payload?.data?.payment_id);
  },
  onPaymentFailed: async (payload: any) => {
    console.log('Dodo payment failed', payload?.data?.payment_id);
  },
});
