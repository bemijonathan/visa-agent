import { uploadFile, deleteFile } from './cloudinary.js'

export async function saveFile(
  buffer: Buffer,
  originalName: string
): Promise<{ fileId: string; fileUrl: string }> {
  const result = await uploadFile(buffer, {
    folder: 'visa-agent/documents',
    resourceType: 'auto',
  })
  return {
    fileId: result.publicId,
    fileUrl: result.secureUrl,
  }
}

export async function removeFile(fileId: string): Promise<void> {
  // Try both image and raw resource types (PDFs are raw, images are image)
  await deleteFile(fileId, 'raw').catch(() => deleteFile(fileId, 'image').catch(() => {}))
}
