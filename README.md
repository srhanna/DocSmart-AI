# DocSmart AI

A simple yet powerful web application that allows users to upload documents and images, then automatically extracts text, identifies key information, and organizes it into structured formats.

## Last Implementation — Document Upload Feature (PR #5)

The most recently completed implementation added a full document upload pipeline:

### What Was Added

- **`components/DocumentUpload.js`** — React component that lets users select and upload JPEG, PNG, or PDF files (max 10 MB). Sends the file to the API via `multipart/form-data` and displays the file name, size, and type on success.
- **`pages/api/upload.js`** — Next.js API route (`POST /api/upload`) that receives the uploaded file using `formidable`, stores it in the **Vercel Blob** store (`doc-smart-ai-blob`) using the `BLOB_READ_WRITE_TOKEN` environment variable, and returns file metadata including the public `blobUrl`.
- **`pages/index.js`** — Home page that lists the app's planned features and renders the `DocumentUpload` component.
- **`pages/_app.js`** — Minimal Next.js app wrapper.
- **`DocumentProcessor.js`** (project root) — A standalone React component that uses Tesseract.js for in-browser OCR. It extracts text, identifies dates and dollar amounts via regex, generates a short summary, and lets users download results as JSON. This component is not yet wired into the running app.
- **Config files** — `next.config.js`, `postcss.config.js`, `tailwind.config.js`, `vercel.json`, `package.json` (dependencies: Next.js 14, React 18, axios, formidable).

### Tech Stack

- **Framework:** Next.js 14 (React 18)
- **Styling:** Tailwind CSS
- **File parsing:** formidable (server-side), Tesseract.js (client-side OCR, in `DocumentProcessor.js`)
- **Blob storage:** @vercel/blob (stores uploaded files in the `doc-smart-ai-blob` store)
- **HTTP client:** axios
- **Deployment:** Vercel

## Getting Started

### 1. Configure environment variables

Copy `.env.local.example` to `.env.local` and set your Vercel Blob token:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```
BLOB_READ_WRITE_TOKEN=<your token from Vercel dashboard → Storage → doc-smart-ai-blob>
```

> **Never commit `.env.local`** — it is listed in `.gitignore`.  
> When deploying to Vercel, add `BLOB_READ_WRITE_TOKEN` as an Environment Variable in your project settings.

### 2. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Rotating the Blob Token

> **Do this immediately if your `BLOB_READ_WRITE_TOKEN` is ever accidentally exposed** (e.g. committed to source control, shared in a chat, or visible in CI logs).  
> A valid token grants full read/write access to all files in the `doc-smart-ai-blob` store.

> **Note:** The Vercel Blob store settings page does **not** have a dedicated "Tokens" section. The token is stored as a project-level environment variable. Follow the steps below to rotate it correctly.

### Step 1 — Open the blob store in the Vercel dashboard

1. Go to [https://vercel.com](https://vercel.com) and sign in.
2. In the left sidebar, click **Storage**.
3. Click the **doc-smart-ai-blob** store.

### Step 2 — Find the token environment variable

Inside the blob store page you will see an **Environment Variables** section (or a **Quickstart** tab) listing the auto-generated `BLOB_READ_WRITE_TOKEN` that was created when the store was connected to your project.

If a **Regenerate** / **Rotate** button is shown next to the variable, click it and confirm. Vercel immediately issues a new token value and updates the environment variable — skip to Step 4.

If no such button is shown, continue with Step 3.

### Step 3 — Manually replace the token in project settings

1. In the Vercel dashboard, go to your **DocSmart AI project**.
2. Click **Settings → Environment Variables**.
3. Find `BLOB_READ_WRITE_TOKEN` in the list and click the **⋯** menu → **Edit**.
4. Delete the current value and paste the new token (obtained e.g. from the Vercel CLI — see below).
5. Ensure all target environments (Production, Preview, Development) are checked, then click **Save**.

**Generating a fresh token value with the Vercel CLI:**

```bash
# If you haven't installed the CLI:
npm i -g vercel

# Log in and link this project, then pull current env vars:
vercel env pull .env.local.tmp

# The pulled file will contain the current BLOB_READ_WRITE_TOKEN.
# After updating the env var in the dashboard (step 3 above), pull again
# to get the new value:
vercel env pull .env.local
rm .env.local.tmp
```

### Step 4 — Update local development

Open `.env.local` (never commit this file — it is in `.gitignore`) and replace the old value:

```
BLOB_READ_WRITE_TOKEN=<new token value>
```

If you used `vercel env pull` above, `.env.local` is already updated — no manual edit needed.

Restart the dev server (`npm run dev`) so the new value is picked up.

### Step 5 — Redeploy to production

After saving the environment variable in the dashboard, **redeploy** the project so live traffic uses the new token:

- Go to the **Deployments** tab, open the latest deployment, and click **Redeploy**, or
- Push a new commit to trigger a fresh deployment automatically.

### Step 6 — Verify

```bash
# Quick smoke-test: upload a file and confirm the blobUrl is returned
curl -X POST http://localhost:3000/api/upload \
  -F "file=@/path/to/test.jpg"
```

A `200` response with a `blobUrl` field confirms the new token is working.

### Checklist

- [ ] New token obtained (via Vercel dashboard Regenerate button **or** Vercel CLI)
- [ ] `BLOB_READ_WRITE_TOKEN` environment variable updated in Vercel project settings (Settings → Environment Variables)
- [ ] `.env.local` updated locally (manually or via `vercel env pull`)
- [ ] Project redeployed
- [ ] Upload smoke-test passes with the new token

