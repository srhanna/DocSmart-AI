import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
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

    const safeFilename = path.basename(uploadedFile.originalFilename).replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileStream = fs.createReadStream(uploadedFile.filepath);
    const blob = await put(safeFilename, fileStream, {
      access: 'public',
      contentType: uploadedFile.mimetype,
    });

    fs.unlink(uploadedFile.filepath, (err) => {
      if (err) console.error('Failed to delete temp file:', err);
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: uploadedFile.originalFilename,
      fileUrl: blob.url,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
