import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { NextApiResponse, NextApiRequest } from 'next';

const MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // Implement user authentication here if needed
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          maximumSizeInBytes: MAX_AVATAR_SIZE_BYTES,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('File uploaded:', blob.url);
        // Here, you can update your database with the new blob URL
      },
    });

    response.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    response.status(400).json({ error: (error as Error).message });
  }
}
