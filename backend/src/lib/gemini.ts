import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

// For text generation and analysis
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

// For vision/OCR tasks
export const geminiVisionModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })

// For embeddings
export const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' })

export async function extractTextFromImage(fileUrl: string): Promise<string> {
  if (!fileUrl.startsWith('http')) {
    throw new Error(`Invalid file URL: ${fileUrl}. Expected a full https:// URL from Cloudinary.`)
  }
  const response = await fetch(fileUrl)
  const imageBuffer = await response.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')
  // Detect MIME type from content-type or file extension
  const contentType = response.headers.get('content-type') || ''
  const mimeType = contentType.split(';')[0].trim() ||
    (fileUrl.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg')

  const result = await geminiVisionModel.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Image,
      },
    },
    {
      text: `Extract ALL text from this document image. Include every piece of text you can see, preserving the structure and layout as much as possible. If this is a passport or ID document, extract all fields including:
- Full name
- Date of birth
- Passport/ID number
- Nationality
- Issue date
- Expiry date
- Place of issue
- Any other visible information

Return the extracted text in a structured format.`,
    },
  ])

  return result.response.text()
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

