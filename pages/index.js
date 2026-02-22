export default function Home() {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '48px', color: '#0070f3', marginBottom: '20px' }}>🤖 DocSmart AI</h1>
      <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px' }}>
        AI-Powered Document Processing
      </p>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>Features:</h2>
        <ul style={{ fontSize: '16px', color: '#555', lineHeight: '1.8' }}>
          <li>📄 Extract text from PDFs</li>
          <li>🖼️ OCR for scanned documents</li>
          <li>🎨 Image processing</li>
          <li>🤖 AI analysis with OpenAI</li>
          <li>📤 Secure document uploads</li>
        </ul>
      </div>

      <button 
        onClick={() => alert('Upload feature coming soon!')}
        style={{
          padding: '15px 40px',
          fontSize: '18px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        🚀 Upload Document
      </button>

      <footer style={{ marginTop: '80px', padding: '20px', color: '#999', fontSize: '14px', borderTop: '1px solid #eee' }}>
        <p>&copy; 2026 DocSmart AI. All rights reserved.</p>
      </footer>
    </div>
  );
}