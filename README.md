# Z-Clothes

Premium clothing storefront built with Next.js App Router, Blogger API v3 and Dodo Payments.

## Product publishing model

1. Create exactly one published Blogger post per product.
2. Put the product image(s) in the post body.
3. Add product metadata as attributes on the post content, for example:

```html
<div data-price="1499"
     data-compare-price="1999"
     data-category="Hoodies"
     data-sizes="S,M,L,XL,XXL"
     data-colors="Black,Stone,Olive"
     data-currency="INR"
     data-dodo-product-id="pdt_your_dodo_product_id"
     data-description="Premium oversized fleece hoodie.">
  <img src="https://example.com/hoodie-front.jpg" alt="Z Premium Hoodie">
  <img src="https://example.com/hoodie-back.jpg" alt="Z Premium Hoodie back">
</div>
```

The site reads published posts from Blogger API v3, so **1 Blogger post = 1 product**. Blogger's public posts endpoint can be read with an API key; private blogs require authorization.

## Environment variables

Copy `.env.example` to `.env.local` and add the values from Google Cloud/Blogger and Dodo Payments.

## Dodo setup

Create matching products in Dodo Payments and place each Dodo product ID in the Blogger post's `data-dodo-product-id`. The app creates a Dodo Checkout Session server-side and redirects the customer to Dodo. Configure the Dodo webhook URL as `/api/webhook` after deployment and add `DODO_PAYMENTS_WEBHOOK_KEY`.

## Run

```bash
npm install
npm run dev
```

The app intentionally falls back to a polished demo catalog until Blogger credentials are configured, which makes the UI previewable before production data is connected.
