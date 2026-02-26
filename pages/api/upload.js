import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { uploadPdfToBlob } from '../../lib/uploadPdfToBlob';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  });

  try {
    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (uploadedFile.mimetype === 'application/pdf') {
      const readWriteToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (!readWriteToken) {
        console.warn('BLOB_READ_WRITE_TOKEN is not configured; skipping Vercel Blob upload for PDF.');
      } else {
        const success = await uploadPdfToBlob(uploadedFile.filepath, readWriteToken);
        if (!success) {
          return res.status(500).json({ error: 'Failed to upload PDF to Vercel Blob Storage. Check server logs for details.' });
        }
      }
    }

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: uploadedFile.originalFilename,
      filePath: uploadedFile.filepath,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
