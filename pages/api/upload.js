import { IncomingForm } from 'formidable';
import os from 'os';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      uploadDir: os.tmpdir(),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No file uploaded' });
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
