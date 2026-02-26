import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const VALID_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const uploadDir = path.join(process.cwd(), 'uploads');
  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
  } catch (mkdirErr) {
    console.error('Failed to create upload directory:', mkdirErr);
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
  });

  try {
    const [, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!VALID_MIME_TYPES.includes(uploadedFile.mimetype)) {
      await fs.promises.unlink(uploadedFile.filepath).catch((unlinkErr) => {
        console.error('Failed to remove invalid file:', unlinkErr);
      });
      return res.status(400).json({ error: 'Invalid file type. Please upload a JPEG, PNG, or PDF file.' });
    }

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: uploadedFile.originalFilename,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
    });
  } catch (err) {
    console.error('Upload error:', err);
    if (err.code === 1009 || (err.message && err.message.toLowerCase().includes('maxfilesize'))) {
      // formidable error code 1009 = maxFileSize exceeded
      return res.status(413).json({ error: 'File size exceeds the 10MB limit.' });
    }
    return res.status(500).json({ error: 'Failed to upload file. Please try again.' });
  }
}
