import { v2 as cloudinary } from 'cloudinary'

function getConfig() {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  }
}

export async function uploadFile(
  fileBuffer: Buffer,
  options: {
    folder?: string
    resourceType?: 'image' | 'raw' | 'auto'
    publicId?: string
  } = {}
): Promise<{ publicId: string; url: string; secureUrl: string }> {
  // Configure on every call to avoid race conditions
  cloudinary.config(getConfig())

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'visa-agent',
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId,
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else if (result) {
          resolve({
            publicId: result.public_id,
            url: result.url,
            secureUrl: result.secure_url,
          })
        }
      }
    )

    uploadStream.end(fileBuffer)
  })
}

export async function deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'image') {
  cloudinary.config(getConfig())
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export async function getFileUrl(publicId: string): Promise<string> {
  cloudinary.config(getConfig())
  return cloudinary.url(publicId, { secure: true })
}
