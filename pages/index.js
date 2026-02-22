export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🤖 DocSmart AI</h1>
      <p>AI-Powered Document Processing</p>
      <div style={{ marginTop: '30px' }}>
        <h2>Features:</h2>
        <ul>
          <li>Extract text from PDFs using pdfjs-dist</li>
          <li>OCR for scanned documents with Tesseract.js</li>
          <li>Image processing with Sharp</li>
          <li>AI analysis with OpenAI</li>
          <li>Document upload with Multer</li>
        </ul>
      </div>
      <button onClick={() => alert('Upload feature coming soon!')} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px' }}>
        Upload Document
      </button>
    </div>
  )
}