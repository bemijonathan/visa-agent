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

export { groq }
