# Dodo Payments setup

1. Create the matching one-time products in Dodo Payments.
2. Copy each Dodo product ID into the matching Blogger post as `data-dodo-product-id`.
3. Add `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PAYMENTS_ENVIRONMENT`, and `DODO_PAYMENTS_RETURN_URL` to Vercel environment variables.
4. Set the Dodo webhook endpoint to `https://YOUR_DOMAIN/api/webhook`.
5. Use Test Mode first; switch the environment to `live_mode` only when the payment flow is tested.

The checkout session is created server-side, so the Dodo API key is never exposed to the browser. The webhook route uses Dodo's Next.js adapter with signature verification.
