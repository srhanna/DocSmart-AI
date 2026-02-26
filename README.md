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

