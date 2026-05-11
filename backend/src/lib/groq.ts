import Groq from 'groq-sdk'
import { extractText } from 'unpdf'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function groqComplete(prompt: string): Promise<string> {
  console.log('[groq] Starting completion, prompt length:', prompt.length)
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    })
    const result = completion.choices[0]?.message?.content || ''
    console.log('[groq] Completion successful, response length:', result.length)
    return result
  } catch (error: any) {
    console.error('[groq] Error:', error.message || error)
    throw error
  }
}

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  console.log('[groq] Extracting text from PDF using unpdf')
  try {
    const { text } = await extractText(new Uint8Array(buffer))
    const trimmed = text.trim()

    if (trimmed.length > 50) {
      console.log('[groq] PDF text extraction successful, length:', trimmed.length)
      return trimmed
    }

    // PDF has no extractable text (likely scanned)
    console.log('[groq] PDF has no text layer, likely a scanned document')
    return ''
  } catch (error: any) {
    console.error('[groq] PDF parse error:', error.message)
    return ''
  }
}

async function extractTextFromImageWithVision(base64Image: string, mimeType: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
          {
            type: 'text',
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
        ],
      },
    ],
    temperature: 0.1,
    max_tokens: 4096,
  })

  return completion.choices[0]?.message?.content || ''
}

export async function extractTextFromImage(fileUrl: string): Promise<string> {
  if (!fileUrl.startsWith('http')) {
    throw new Error(`Invalid file URL: ${fileUrl}. Expected a full https:// URL.`)
  }

  console.log('[groq] Extracting text from:', fileUrl)

  const response = await fetch(fileUrl)
  const fileBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(fileBuffer)

  // Detect MIME type from content-type or file extension
  const contentType = response.headers.get('content-type') || ''
  let mimeType = contentType.split(';')[0].trim()

  // Fallback mime type detection
  if (!mimeType || mimeType === 'application/octet-stream') {
    if (fileUrl.includes('.pdf')) mimeType = 'application/pdf'
    else if (fileUrl.includes('.png')) mimeType = 'image/png'
    else if (fileUrl.includes('.jpg') || fileUrl.includes('.jpeg')) mimeType = 'image/jpeg'
    else if (fileUrl.includes('.webp')) mimeType = 'image/webp'
    else mimeType = 'image/jpeg'
  }

  // Handle PDFs
  if (mimeType === 'application/pdf') {
    const pdfText = await extractTextFromPdf(buffer)

    if (pdfText) {
      return pdfText
    }

    // PDF is scanned - cannot process without page-to-image conversion
    throw new Error('This PDF appears to be a scanned document without a text layer. Please upload images of the individual pages instead.')
  }

  // Handle images with vision API
  try {
    const base64Image = buffer.toString('base64')
    const result = await extractTextFromImageWithVision(base64Image, mimeType)
    console.log('[groq] Vision extraction successful, response length:', result.length)
    return result
  } catch (error: any) {
    console.error('[groq] Vision error:', error.message || error)
    throw error
  }
}

export { groq }
