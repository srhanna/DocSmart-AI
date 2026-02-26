import { put } from '@vercel/blob';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new IncomingForm({
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024,
  });

  try {
    const [, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileContent = fs.readFileSync(uploadedFile.filepath);
    let blob;
    try {
      blob = await put(uploadedFile.originalFilename, fileContent, {
        access: 'public',
        contentType: uploadedFile.mimetype,
      });
    } finally {
      fs.unlinkSync(uploadedFile.filepath);
    }

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: uploadedFile.originalFilename,
      blobUrl: blob.url,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
