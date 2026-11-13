# ORVANA storefront

Static website for [@orvana.automative](https://www.instagram.com/orvana.automative/): 3D-printed air ducts for Malaysian cars.

Customers either:

- **Order for delivery**: the form posts to `/api/order` ([functions/api/order.js](functions/api/order.js)), which checks the order, prices it from `config.js`, and emails it to orvana.team@gmail.com through [Resend](https://resend.com). ORVANA then contacts the customer to confirm and send payment details.
- **Arrange installation or handover in KL or JB**: the site links to the Instagram accounts of the people who handle it.

## Editing the store

Everything you'll usually change is in [`assets/js/config.js`](assets/js/config.js). The website and the order function both read it:

- `orderEmail`: where delivery orders are sent
- `installers`: the KL and JB contacts for installation and handover (Instagram handles)
- `products`: name, price (shipping included), colours, image, and `available: false` for "coming soon"

Product photos go in `assets/img/`.

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Order emails (one-time setup)

1. Sign up at [resend.com](https://resend.com) with **orvana.team@gmail.com**. The free plan allows 3,000 emails a month.
2. In Resend, create an API key with **Sending access**.
3. In Cloudflare, open **Workers & Pages → orvana → Settings → Variables and Secrets**. Add `RESEND_API_KEY` as a **Secret** for Production, then redeploy.

Until the key is set, the order form shows customers a link to email their order instead.

Optional variables:

- `ORDER_EMAIL`: send orders somewhere other than `orderEmail` in `config.js`.
- `MAIL_FROM`: the sender address. The default, `onboarding@resend.dev`, can only deliver to the email you signed up to Resend with. After you buy a domain and verify it in Resend, set this to something like `ORVANA <orders@yourdomain>`.

The `python3 -m http.server` preview doesn't run `/api/order`. To test the function locally, run `npx wrangler pages dev .` with a `.dev.vars` file containing `RESEND_API_KEY=...`.

## Deploying

The site is hosted on Cloudflare Pages at https://orvana.pages.dev. Cloudflare redeploys automatically whenever `main` is pushed; there is no build step. Deploys and custom domains are managed in the Cloudflare dashboard under **Workers & Pages → orvana**.
