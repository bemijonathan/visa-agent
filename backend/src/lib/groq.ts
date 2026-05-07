import Groq from 'groq-sdk'

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

export async function extractTextFromImage(fileUrl: string): Promise<string> {
  if (!fileUrl.startsWith('http')) {
    throw new Error(`Invalid file URL: ${fileUrl}. Expected a full https:// URL.`)
  }

  console.log('[groq] Extracting text from:', fileUrl)

  const response = await fetch(fileUrl)
  const imageBuffer = await response.arrayBuffer()
  const base64Image = Buffer.from(imageBuffer).toString('base64')

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

  // Groq vision only supports images, not PDFs directly
  if (mimeType === 'application/pdf') {
    throw new Error('PDF extraction not supported yet. Please upload an image of the document.')
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
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

    const result = completion.choices[0]?.message?.content || ''
    console.log('[groq] Vision extraction successful, response length:', result.length)
    return result
  } catch (error: any) {
    console.error('[groq] Vision error:', error.message || error)
    throw error
  }
}

export { groq }
