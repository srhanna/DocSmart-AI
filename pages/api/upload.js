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
    const [, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalFilename, filepath, size, mimetype } = uploadedFile;

    // Sanitize filename to prevent path traversal and log injection
    const safeFilename = path.basename(originalFilename || 'upload').replace(/[^\w.\-]/g, '_');

    console.log(`Attempting to upload: ${safeFilename}, size: ${size} bytes`);

    const fileStream = fs.createReadStream(filepath);

    let blob;
    try {
      blob = await put(safeFilename, fileStream, { access: 'public' });
      console.log(`Upload successful. Blob URL: ${blob.url}, status: 200`);
    } catch (uploadErr) {
      console.error(`Error uploading file to Vercel Blob: ${uploadErr.message}`, uploadErr.stack);
      return res.status(500).json({ error: 'Failed to upload file to storage', success: false });
    } finally {
      fs.unlink(filepath, (unlinkErr) => {
        if (unlinkErr) console.error('Failed to cleanup temp file:', unlinkErr);
      });
    }

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: safeFilename,
      blobUrl: blob.url,
      fileSize: size,
      fileType: mimetype,
      success: true,
    });
  } catch (err) {
    console.error('Upload error:', err.message, err.stack);
    return res.status(500).json({ error: 'Failed to upload file', success: false });
  }
}
