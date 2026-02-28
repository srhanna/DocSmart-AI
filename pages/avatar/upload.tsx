import { type PutBlobResult } from '@vercel/blob';
import { upload } from '@vercel/blob/client';
import { useState, useRef } from 'react';

export default function AvatarUploadPage() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const file = inputFileRef.current?.files?.[0];
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/avatar/upload',
      });
      setBlob(newBlob);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <h1>Upload Your Avatar</h1>

      <form onSubmit={handleSubmit}>
        <input name="file" ref={inputFileRef} type="file" accept="image/*" required />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {blob && (
        <div>
          <p>
            Blob URL:{' '}
            <a href={blob.url} target="_blank" rel="noopener noreferrer">
              {blob.url}
            </a>
          </p>
        </div>
      )}
    </>
  );
}
