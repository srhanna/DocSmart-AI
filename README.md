# DocSmart AI

AI-powered document processing web application. Upload a JPEG, PNG, or PDF and the app extracts text, identifies dates and amounts, and lets you download the results.

## Tech Stack

- **Next.js 14** (Pages Router)
- **React 18**
- **Tailwind CSS 3**
- **tesseract.js** — client-side OCR

## Project structure

```
pages/
  _app.js          ← global CSS wrapper
  index.js         ← home page (renders DocumentProcessor)
  api/
    process.js     ← API route placeholder

components/
  DocumentProcessor.js   ← upload + OCR + results UI

styles/
  globals.css      ← Tailwind base styles
```

## Local development

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # production build
npm run lint      # ESLint
```

## Deployment (Vercel)

`vercel.json` is included in this repo — it tells Vercel to use the Next.js framework:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install"
}
```

When this code is on the `main` branch, Vercel will build it correctly and serve a rendered HTML page instead of raw JavaScript source.
