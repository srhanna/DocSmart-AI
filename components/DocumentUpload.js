import { useState } from 'react';
import { upload } from '@vercel/blob/client';

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(selected.type)) {
      setError('Please upload a JPEG, PNG, or PDF file.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setFile(selected);
    setError(null);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const blob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
      });
      setResult({ fileName: file.name, fileSize: file.size, fileType: file.type, url: blob.url });
    } catch (err) {
      setError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px', textAlign: 'center' }}>
        Upload Document
      </h2>

      {!result && (
        <>
          <div
            style={{
              border: '2px dashed #0070f3',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '20px',
              backgroundColor: '#f9fafb',
            }}
          >
            <input
              type="file"
              id="file-upload"
              accept=".jpeg,.jpg,.png,.pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>📁</div>
              <p style={{ color: '#555', fontSize: '16px' }}>
                {file ? file.name : 'Click to select a file'}
              </p>
              <p style={{ color: '#999', fontSize: '13px', marginTop: '6px' }}>
                Supported: JPEG, PNG, PDF (max 10MB)
              </p>
            </label>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '12px 16px',
                color: '#b91c1c',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              backgroundColor: !file || loading ? '#93c5fd' : '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: !file || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </>
      )}

      {result && (
        <div
          style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
          <h3 style={{ color: '#166534', fontSize: '20px', marginBottom: '12px' }}>
            Upload Successful!
          </h3>
          <p style={{ color: '#555', marginBottom: '6px' }}>
            <strong>File:</strong> {result.fileName}
          </p>
          <p style={{ color: '#555', marginBottom: '6px' }}>
            <strong>Size:</strong> {(result.fileSize / 1024).toFixed(1)} KB
          </p>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            <strong>Type:</strong> {result.fileType}
          </p>
          {result.url && (
            <p style={{ color: '#555', marginBottom: '20px', wordBreak: 'break-all' }}>
              <strong>URL:</strong>{' '}
              <a href={result.url} target="_blank" rel="noreferrer" style={{ color: '#0070f3' }}>
                {result.url}
              </a>
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              fontSize: '15px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Upload Another Document
          </button>
        </div>
      )}
    </div>
  );
}
