DocSmart AI - A simple yet powerful web application that allows users
to upload documents and images, then automatically extracts text, identifies
key information, and organizes it into structured formats.

## Setup

1. Install dependencies: `npm install`
2. If you add environment variables (e.g. API keys), copy `.env.example` to
   `.env.local`, add your values there, and keep that file out of git.
3. Run the development server: `npm run dev`

## Security — Keeping Secrets Safe

**Never commit API keys, access tokens, or other credentials to this repository.**

- All secrets (Vercel tokens, API keys, etc.) must be configured via the
  [Vercel dashboard](https://vercel.com/dashboard) under
  **Project Settings → Environment Variables**.
- Local secrets go in `.env.local` which is listed in `.gitignore` and will
  never be committed.
- If you accidentally expose a secret in a commit, revoke it immediately from
  the issuing service and generate a new one.

