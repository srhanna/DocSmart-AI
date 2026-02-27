import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <h1>Upload Your Avatar</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);

          if (!inputFileRef.current?.files?.length) {
            setError('Please select a file to upload.');
            return;
          }

          const file = inputFileRef.current.files[0];

          const maxSize = 4 * 1024 * 1024; // 4MB
          if (file.size > maxSize) {
            setError('File size must be less than 4MB.');
            return;
          }

          // Sanitize filename: keep only alphanumeric, dots, dashes, and underscores
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

          try {
            const newBlob = await upload(safeName, file, {
              access: 'public',
              handleUploadUrl: '/api/avatar/upload',
            });
            setBlob(newBlob);
          } catch (err) {
            setError('Upload failed. Please try again.');
            console.error('Upload error:', err);
          }
        }}
      >
        <input name="file" ref={inputFileRef} type="file" accept="image/*" required />
        <button type="submit">Upload</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {blob && (
        <div>
          <p>Blob URL: <a href={blob.url}>{blob.url}</a></p>
        </div>
      )}
    </>
  );
}
