import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        // Implement user authentication here if needed
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          maximumSizeInBytes: 4 * 1024 * 1024, // 4MB
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('File uploaded:', blob.url);
        // Here, you can update your database with the new blob URL
      },
    });

    response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    response.status(500).json({ error: 'File upload failed' });
  }
}
