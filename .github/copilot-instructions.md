# Copilot Instructions for DocSmart AI

## Project Overview

DocSmart AI is a Next.js web application that allows users to upload documents and images, automatically extracts text, identifies key information, and organizes it into structured formats using AI.

## Tech Stack

- **Framework**: Next.js 14 (Pages Router)
- **Frontend**: React 18 with inline styles (no CSS modules or styled-components)
- **HTTP Client**: Axios
- **File Parsing**: Formidable (multipart form data / file uploads)
- **Styling**: Tailwind CSS (configured but primarily uses inline styles in components)
- **Deployment**: Vercel

## Project Structure

```
/
├── components/         # Reusable React components
│   └── DocumentUpload.js
├── pages/              # Next.js pages and API routes
│   ├── _app.js
│   ├── index.js
│   └── api/
│       └── upload.js   # File upload API endpoint
├── DocumentProcessor.js  # Document processing logic
├── process.js            # Processing utilities
├── next.config.js
├── tailwind.config.js
└── package.json
```

## Code Style & Conventions

- **Language**: Plain JavaScript (no TypeScript)
- **Components**: Functional components with React hooks (`useState`)
- **Styling**: Inline styles as JavaScript objects; use Tailwind utility classes when adding new class-based styling
- **API routes**: Next.js API routes in `pages/api/`; always export a `config` object when disabling the default body parser
- **Error handling**: Return structured JSON errors with appropriate HTTP status codes from API routes; display user-friendly messages in the UI
- **File validation**: Validate file type and size on both client (component) and server (API route)

## Supported File Types & Limits

- JPEG, JPG, PNG, PDF
- Maximum file size: 10 MB

## Running the Project

```bash
npm install
npm run dev      # Development server on http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
```

## Key Patterns

- File uploads use `multipart/form-data` via Axios on the client and Formidable on the server
- Uploaded files are stored temporarily in an `uploads/` directory at the project root (created automatically)
- API responses follow the shape: `{ message, fileName, filePath, fileSize, fileType }` on success, or `{ error }` on failure
- UI state is managed locally with `useState`; no global state management library is used
