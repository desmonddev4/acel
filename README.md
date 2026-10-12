# ACEL — African Chamber of ESG Leadership

Website and staff administration system for the African Chamber of ESG Leadership, built with **React 18 + Vite**, **Tailwind CSS**, **Framer Motion**, and a **Django REST API**. Content is sourced directly from `ACEL_Website_Content.docx` and `ACEL_Organisational_Profile_2026.docx`.

## Stack

- **React 18** + **Vite** — fast dev server, ES modules, no bundler ceremony
- **Tailwind CSS** — utility-first styling with a custom design-token theme (`tailwind.config.js`)
- **Framer Motion** — orchestrated hero entrance, scroll reveals, animated counters, tab transitions
- **Django REST Framework** — submissions, member/certificate registers, staff API
- Fonts: **Fraunces** (display serif) + **IBM Plex Sans** (body/UI), loaded via Google Fonts

## Getting started

```bash
npm ci
npm run dev                  # http://localhost:5173
npm run build

python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
python backend/manage.py migrate
python backend/manage.py createsuperuser
python backend/manage.py runserver 8000  # API at http://localhost:8000/api
```

Requires Node 18+ and Python 3.10+. Open `/admin/login` and sign in with a
Django superuser or another Django staff account.

## Project structure

```
src/
  components/       one component per section (Nav, Hero, WhoWeAre, WhyNow,
                     Differentiators, WhatWeDo, Membership, Certification,
                     Sectors, Governance, JoinCTA, Footer)
  components/Seal.jsx     the recurring "seal" logomark, static + animated
  components/Reveal.jsx   shared scroll-reveal + stagger-group primitives
  data/content.js   all real copy, structured as plain JS — edit this file
                     to change any text on the site without touching a
                     single component
  index.css         Tailwind layers, focus states, reduced-motion handling
  App.jsx           router: shared Nav + Footer around the page routes
  pages/            one file per route, each composing the section components
  admin/            separate client admin pages, login and API client
  components/ScrollToTop.jsx   resets scroll on navigation, honours #hash links
backend/
  config/           Django settings, URLs, ASGI and WSGI entry points
  records/          records, serializers, public/admin API and tests
tailwind.config.js  color tokens, font families, breakpoints
```

## Pages

| Route            | Page file                | Sections                          |
|------------------|--------------------------|-----------------------------------|
| `/`              | `pages/Home.jsx`         | Hero, JoinCTA                     |
| `/about`         | `pages/About.jsx`        | WhoWeAre, Values, WhyNow, Differentiators |
| `/what-we-do`    | `pages/WhatWeDo.jsx`     | WhatWeDo, Sectors                 |
| `/membership`    | `pages/Membership.jsx`   | Membership                        |
| `/membership/apply` | `pages/MembershipApply.jsx` | Application form (organisation / individual) |
| `/membership/directory` | `pages/MembershipDirectory.jsx` | Searchable live member directory |
| `/certification` | `pages/Certification.jsx`| Certification                     |
| `/certification/register` | `pages/CertificationRegister.jsx` | Registration form |
| `/certification/verify` | `pages/CertificationVerify.jsx` | Live certificate lookup |
| `/governance`    | `pages/Governance.jsx`   | Governance, GovernanceDetail, Founders |

Also routed: `/contact`, `/privacy`, `/terms`, and a 404 page for unknown URLs.

Navigation uses `react-router-dom`. `vercel.json` rewrites every path to
`index.html`, so deep links and refreshes work in production.

## Forms

Every public form (`/contact`, `/certification/register`, `/membership/apply`)
POSTs to Django through `src/lib/submitForm.js`. Submissions are persisted for
staff review in the admin portal. `VITE_FORM_DEMO=true` enables a disconnected
frontend demo only; it does not save submissions.

- Live submissions fail visibly when the API is unavailable.
- Certification fees shown on the register and application forms come from
  `membership.dues` in `src/data/content.js` and are placeholders until
  confirmed. Backend fees are configured separately with `CERTIFICATION_FEES`
  and must be kept in sync with the public fee content.
- `src/data/legal.js` holds a **draft** privacy policy and terms. They need
  legal review, and the `[bracketed]` gaps filled, before launch.

## Payments

Certification registration (`/certification/register`) has a Paystack
payment step, since certification fees are fixed per level ($100 / $250 /
$500 — see `membership.dues`). The Django API verifies successful transactions
using the secret key before saving a registration:

- `src/lib/paystack.js` opens Paystack's Inline popup. Configure the public
  key as `VITE_PAYSTACK_PUBLIC_KEY` and the secret key as `PAYSTACK_SECRET_KEY`
  only in the Django environment. The backend checks reference, status,
  currency, amount, and customer email against the selected level.
- In local development, absent Paystack keys allow an explicitly labelled
  simulated payment. Production (`DJANGO_DEBUG=false`) rejects demo payments.
- Before accepting live payments, confirm fees, currency, and account settings
  with the client. Never expose the Paystack secret in Vite.
- Membership application (`/membership/apply`) deliberately has **no**
  payment step: its application fee is a band ($100–$300 for organisations,
  $20–$50 for individuals), not a fixed figure, and the source content
  describes payment happening after the Secretariat approves the
  application and confirms the amount — not at the time of applying. Add a
  payment step there once the Chamber sets a fixed fee schedule, or decides
  to charge a deposit at application time instead.

## Public Registers

The member directory reads public member records from Django. Certificate
verification queries certificate records managed in the admin portal. The
development database starts empty; approved applications do not automatically
create members, so staff add the final member record after approval. Configure
a production database before deployment.

## Admin Portal

The client portal is a separate, staff-only React area at `/admin/login`. Its
pages cover the dashboard, membership applications, certification registrations,
contact messages, members, and certificates. Staff can review submissions,
update review/message status, and create, edit, or delete member and certificate
records. Public member and certificate pages read from this same database.

Create staff accounts with Django's `createsuperuser` command or through
`/django-admin/`. Admin API access requires a Django staff account and uses
short-lived JWT access tokens. There is no public staff-account registration.

## Deploy Backend to Render

The root `render.yaml` is a Render Blueprint for the Django API and managed
PostgreSQL database. Push the repository to GitHub, then in Render choose
**New + → Blueprint** and select this repository. The Blueprint installs the
Python requirements, collects Django admin static files, runs migrations as a
pre-deploy step, and starts Gunicorn. Render's health check uses
`/api/health/`.

When prompted for Blueprint environment values, set:

- `CORS_ALLOWED_ORIGINS` to the exact deployed frontend origin, including its
  scheme and host but no path or trailing slash, such as
  `https://your-site.vercel.app`. This is required for the API to start in
  production; update it if the frontend domain changes.
- `PAYSTACK_SECRET_KEY` to the secret key matching the public key configured
  as `VITE_PAYSTACK_PUBLIC_KEY` in the frontend. Keep it only in Render's
  environment settings, never in frontend variables or source control.

After the first deploy, copy the Render API service URL and set the frontend
build variable `VITE_API_URL` to `https://<render-service>.onrender.com/api`,
then rebuild/redeploy the frontend. Confirm `/api/health/` returns `{"ok":true}`
and test a form submission. Create the production admin account from the
Render service shell with `python manage.py createsuperuser`; the local SQLite
superuser is not copied to Render's PostgreSQL database. Then test staff sign-in.
The Blueprint creates a managed PostgreSQL database, uses Render's assigned
hostname, disables demo payments, and enables HTTPS-related Django security
settings. Keep database credentials and Django's generated secret in
Render-managed environment variables.

## Brand

The logo is `public/acel-logo.jpeg`. The color tokens below were originally
sampled from an earlier version of the mark; the logo has since been updated
and the palette was deliberately kept as-is rather than re-sampled, so the
hex values are no longer a literal read of the current file:

| Token (Tailwind)  | Hex       | Note                       |
|--------------------|-----------|----------------------------|
| `ink`              | `#00142D` | deep navy                  |
| `gold`             | `#C37C0C` | accent gold                |
| `emerald`          | `#047622` | primary green              |
| `paper`            | `#FFFFFF` | background                 |

`bright`/`deep`/`soft`/`faint` variants of each are derived tints/shades —
see `tailwind.config.js`. Every component references the token names, not
raw hex, so a deliberate re-theme only requires updating these four values
in one file.

`src/components/Seal.jsx` uses the supplied logo image everywhere the
recurring mark appears, so future logo revisions only require replacing
the asset and updating its path.

## Design notes

- **Type:** Fraunces (display) paired with IBM Plex Sans (body) — a serif
  with real character for an institutional, standards-setting body,
  set against a clean, technical sans for body copy and UI chrome.
- **Motion:** one orchestrated entrance on the hero (the mark draws in —
  rings, then the trend line, then the dot and axis — then copy and CTAs
  stagger); scroll-triggered reveals on section headers; staggered
  card/list reveals within a section; animated key-figure counters; a
  spring-driven tab pill in Membership. Motion is restrained everywhere
  else, and `prefers-reduced-motion` is respected globally.
- **Editing content:** everything user-facing lives in `src/data/content.js`.
  Update copy, add/remove sector tags, membership tiers, certification
  levels, or footer links there — components render whatever is in the
  array.

## Accessibility

- Semantic headings (`h1`–`h4`), `sr-only` labels for stat figures
- Visible focus rings on all interactive elements
- `prefers-reduced-motion` disables/shortens all animation
- Color contrast checked against WCAG AA for text on both paper and ink backgrounds

## Deployment

The build output in `/dist` after `npm run build` is static and can be
deployed to any static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, etc.) with no server required.
