import DocumentProcessor from '../components/DocumentProcessor';

export default function Home() {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '48px', color: '#0070f3', marginBottom: '20px' }}>🤖 DocSmart AI</h1>
      <p style={{ fontSize: '20px', color: '#666', marginBottom: '40px' }}>
        AI-Powered Document Processing
      </p>

      <DocumentProcessor />

      <footer style={{ marginTop: '80px', padding: '20px', color: '#999', fontSize: '14px', borderTop: '1px solid #eee' }}>
        <p>&copy; 2026 DocSmart AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
