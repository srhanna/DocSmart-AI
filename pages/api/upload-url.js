import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const jsonResponse = await handleUpload({
    body: req.body,
    request: req,
    onBeforeGenerateToken: async (pathname) => {
      return {
        access: 'public',
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
        maximumSizeInBytes: 10 * 1024 * 1024,
      };
    },
    onUploadCompleted: async ({ blob }) => {
      console.log('Upload completed:', blob.url);
    },
  });

  return res.status(200).json(jsonResponse);
}
