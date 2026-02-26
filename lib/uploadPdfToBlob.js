import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

async function uploadToVercelBlob(fileName, fileContent, readWriteToken) {
  return put(fileName, fileContent, {
    access: 'public',
    token: readWriteToken,
  });
}

export async function uploadPdfToBlob(pdfFilePath, readWriteToken) {
  const fileName = path.basename(pdfFilePath);
  console.log(`Uploading file: ${fileName}, path: ${pdfFilePath}`);

  try {
    const fileContent = fs.createReadStream(pdfFilePath);
    await uploadToVercelBlob(fileName, fileContent, readWriteToken);
    return true;
  } catch (err) {
    console.error('Failed to upload PDF to Vercel Blob:', err);
    return false;
  }
}
