import { IncomingForm } from 'formidable';
import fs from 'fs';
import { put } from '@vercel/blob';

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
    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let blob;
    try {
      const fileStream = fs.createReadStream(uploadedFile.filepath);
      blob = await put(uploadedFile.originalFilename, fileStream, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } finally {
      fs.unlinkSync(uploadedFile.filepath);
    }

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: uploadedFile.originalFilename,
      filePath: blob.url,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
