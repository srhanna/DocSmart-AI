const fs = require('fs');
const path = require('path');

async function uploadPdfToBlob(pdfFilePath, readWriteToken) {
  try {
    console.log(`Uploading: ${pdfFilePath}`);

    const fileBuffer = await fs.promises.readFile(pdfFilePath);
    const fileName = path.basename(pdfFilePath);
    const formData = new FormData();
    formData.append('file', new Blob([fileBuffer], { type: 'application/pdf' }), fileName);

    const response = await fetch(
      'https://doc-smart-hchhayb2t-srhannas-projects.vercel.app/api/upload-to-blob',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${readWriteToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      console.error(`Upload failed: ${response.status} ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    console.log('Upload successful:', data);
    return true;

  } catch (error) {
    console.error('Upload error:', error);
    return false;
  }
}

async function main() {
  const pdfFilePath = process.argv[2];
  const readWriteToken = process.argv[3];

  if (!pdfFilePath || !readWriteToken) {
    console.error('Usage: node upload-pdf.js <pdfFilePath> <readWriteToken>');
    process.exit(1);
  }

  if (!fs.existsSync(pdfFilePath)) {
    console.error(`File not found: ${pdfFilePath}`);
    process.exit(1);
  }

  const success = await uploadPdfToBlob(pdfFilePath, readWriteToken);
  process.exit(success ? 0 : 1);
}

main();
