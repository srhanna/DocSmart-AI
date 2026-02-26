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

### Step 1 — Open the Vercel dashboard

1. Go to [https://vercel.com](https://vercel.com) and sign in.
2. In the top navigation, click **Storage**.
3. Click the **doc-smart-ai-blob** store.

### Step 2 — Delete the compromised token

1. Click the **Settings** tab (inside the blob store view).
2. Scroll to the **Tokens** section.
3. Find the token you want to revoke and click the **⋯** (three-dot) menu to its right.
4. Select **Delete** and confirm.  
   The old token becomes invalid immediately — any running process using it will start receiving `401 Unauthorized` errors.

### Step 3 — Generate a new token

1. Still in **Settings → Tokens**, click **Create Token**.
2. Give it a descriptive name (e.g. `docsmart-prod-2026-02`) and choose the **Read/Write** permission scope.
3. Click **Create**.
4. **Copy the token immediately** — it is only shown once.

### Step 4 — Update local development

```bash
# Open (or create) your local env file
# This file is listed in .gitignore and must never be committed
nano .env.local
```

Replace the old value:

```
BLOB_READ_WRITE_TOKEN=<paste new token here>
```

Restart the dev server (`npm run dev`) so the new value is picked up.

### Step 5 — Update the Vercel project environment variable

1. In the Vercel dashboard, go to your **DocSmart AI project**.
2. Click **Settings → Environment Variables**.
3. Find `BLOB_READ_WRITE_TOKEN`, click **Edit**, and paste the new token.
4. Choose which environments (Production / Preview / Development) should receive it.
5. Click **Save**.
6. **Redeploy** the project so the change takes effect:  
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

- [ ] Old token deleted in Vercel dashboard (Storage → doc-smart-ai-blob → Settings → Tokens)
- [ ] New token generated and copied
- [ ] `.env.local` updated locally
- [ ] `BLOB_READ_WRITE_TOKEN` environment variable updated in Vercel project settings
- [ ] Project redeployed
- [ ] Upload smoke-test passes with the new token

