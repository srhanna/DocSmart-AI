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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }
  const token = authHeader.slice(7);

  const form = new IncomingForm({ maxFileSize: 10 * 1024 * 1024 });

  let uploadedFile;
  try {
    const [_fields, files] = await form.parse(req);
    uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileStream = fs.createReadStream(uploadedFile.filepath);
    const blob = await put(uploadedFile.originalFilename, fileStream, {
      access: 'public',
      token,
    });

    return res.status(200).json({
      message: 'File uploaded to blob successfully',
      url: blob.url,
      fileName: uploadedFile.originalFilename,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
    });
  } catch (err) {
    console.error('Blob upload error:', err);
    return res.status(500).json({ error: 'Failed to upload file to blob storage' });
  } finally {
    if (uploadedFile?.filepath) {
      fs.unlink(uploadedFile.filepath, () => {});
    }
  }
}
