import Busboy from 'busboy';

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
    const fileInfo = await new Promise((resolve, reject) => {
      const bb = Busboy({
        headers: req.headers,
        limits: { fileSize: 10 * 1024 * 1024 },
      });
      let result = null;
      let firstFileReceived = false;
      let limitExceeded = false;

      bb.on('file', (_fieldname, fileStream, info) => {
        // Only capture metadata for the first file; drain any extra files
        if (firstFileReceived || limitExceeded) {
          fileStream.resume();
          return;
        }
        firstFileReceived = true;

        const { filename, mimeType } = info;
        let fileSize = 0;

        // File content is intentionally not stored; we only need metadata
        fileStream.on('data', (chunk) => {
          fileSize += chunk.length;
        });
        fileStream.on('limit', () => {
          limitExceeded = true;
          reject(new Error('File size exceeds 10MB limit'));
        });
        fileStream.on('close', () => {
          if (!limitExceeded) {
            result = { filename, mimeType, fileSize };
          }
        });
      });

      bb.on('close', () => {
        if (!result && !limitExceeded) {
          reject(new Error('No file uploaded'));
        } else if (result) {
          resolve(result);
        }
      });

      bb.on('error', (err) => reject(err));

      req.pipe(bb);
    });

    return res.status(200).json({
      message: 'File uploaded successfully',
      fileName: fileInfo.filename,
      fileSize: fileInfo.fileSize,
      fileType: fileInfo.mimeType,
    });
  } catch (err) {
    console.error('Upload error:', err);
    if (err.message === 'No file uploaded') {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (err.message === 'File size exceeds 10MB limit') {
      return res.status(400).json({ error: 'File size must be less than 10MB' });
    }
    return res.status(500).json({ error: 'Failed to upload file' });
  }
}
