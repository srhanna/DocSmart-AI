DocSmart AI - A simple yet powerful web application that allows users
to upload documents and images, then automatically extracts text, identifies
key information, and organizes it into structured formats.

## Setup

1. Install dependencies: `npm install`
2. If you add environment variables (e.g. API keys), copy `.env.example` to
   `.env.local`, add your values there, and keep that file out of git.
3. Run the development server: `npm run dev`

## Deploying to Vercel

### Initial deployment

1. Push this repository to GitHub (or fork it).
2. Go to [vercel.com](https://vercel.com) and create a new project by importing
   the GitHub repository.
3. Vercel will automatically detect Next.js and use the settings in
   `vercel.json`. Click **Deploy**.

### Adding a custom domain (e.g. `docsmart-ai.com`)

After the initial deployment succeeds on the auto-generated Vercel URL
(e.g. `https://doc-smart-65zdql0r5-srhannas-projects.vercel.app`), do the
following to make `docsmart-ai.com` work:

1. **Add the domain in the Vercel Dashboard**
   - Open your project → **Settings → Domains**.
   - Type `docsmart-ai.com` and click **Add**.
   - Vercel will display the DNS records you need to set.

2. **Configure DNS at your domain registrar**

   Vercel supports two approaches:

   | Approach | Record type | Name | Value |
   |---|---|---|---|
   | Recommended – point nameservers to Vercel | NS | `@` | Vercel nameservers shown in dashboard |
   | CNAME/A record (third-party DNS) | `A` | `@` | `76.76.21.21` |
   | CNAME/A record (third-party DNS) | `CNAME` | `www` | `cname.vercel-dns.com` |

   Use the values shown in the Vercel dashboard — they are authoritative for
   your specific project.

3. **Wait for DNS propagation** (usually a few minutes, up to 48 hours).
   Vercel will automatically provision a free TLS certificate once it can
   verify domain ownership.

4. **Verify** by visiting `https://docsmart-ai.com`. If you also added
   `www.docsmart-ai.com`, the `vercel.json` redirect in this repository will
   forward all `www` traffic to the apex domain automatically.

### Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `docsmart-ai.com` shows a DNS error | DNS not pointing to Vercel | Set A/CNAME records as above |
| Certificate warning | TLS not yet provisioned | Wait a few minutes and refresh |
| `www.docsmart-ai.com` doesn't redirect | `www` not added in Vercel dashboard | Add `www.docsmart-ai.com` as an alias in **Settings → Domains** |
| Preview URL works, custom domain shows 404 | Domain added to Vercel but DNS not updated | Update DNS records at your registrar |

## Security — Keeping Secrets Safe

**Never commit API keys, access tokens, or other credentials to this repository.**

- All secrets (Vercel tokens, API keys, etc.) must be configured via the
  [Vercel dashboard](https://vercel.com/dashboard) under
  **Project Settings → Environment Variables**.
- Local secrets go in `.env.local` which is listed in `.gitignore` and will
  never be committed.
- If you accidentally expose a secret in a commit, revoke it immediately from
  the issuing service and generate a new one.

