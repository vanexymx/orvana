# ORVANA storefront

Static website for [@orvana.automative](https://www.instagram.com/orvana.automative/): 3D-printed air ducts for Malaysian cars.

Customers either:

- **Order for delivery**: the form emails the order to orvana.team@gmail.com through [FormSubmit](https://formsubmit.co). ORVANA then contacts the customer to confirm and send payment details.
- **Arrange installation or handover in KL or JB**: the site links to the Instagram accounts of the people who handle it.

## Editing the store

Everything you'll usually change is in [`assets/js/config.js`](assets/js/config.js):

- `orderEmail`: where delivery orders are sent
- `installers`: the KL and JB contacts for installation and handover (Instagram handles)
- `products`: name, price (shipping included), colours, image, and `available: false` for "coming soon"

Product photos go in `assets/img/`.

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Turning on order emails (one time)

After the site is live, place one test order. FormSubmit will email orvana.team@gmail.com an activation link. Click it, and every order after that arrives in the inbox. Until it's activated, customers see a button to email the order themselves instead.

## Deploying

Pushing to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`. To set that up the first time, open the repo **Settings → Pages** and set **Source** to **GitHub Actions**.
