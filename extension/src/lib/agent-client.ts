const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ToolResult {
  name: string
  input: Record<string, any>
  result: string
}

export async function sendMessage(
  messages: Message[],
  token: string,
  context?: { pageHtml?: string },
  onText?: (text: string) => void,
  onToolResult?: (result: ToolResult) => void
): Promise<void> {
  const response = await fetch(`${API_URL}/api/agent/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, context }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || `Request failed: ${response.status}`)
  }

  if (!response.body) throw new Error('No response body')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        // Track the event type for the following data line
        currentEvent = line.slice(7).trim()
        continue
      }

      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') continue

        if (currentEvent === 'text' || currentEvent === '') {
          onText?.(data)
        } else if (currentEvent === 'tool_result') {
          try {
            onToolResult?.(JSON.parse(data))
          } catch {}
        }

        currentEvent = '' // reset after consuming
      }

      if (line === '') {
        // blank line = end of SSE event block
        currentEvent = ''
      }
    }
  }
}

// Sync API for simpler use cases
export async function sendMessageSync(
  messages: Message[],
  token: string,
  context?: { pageHtml?: string }
): Promise<{ content: string; toolCalls: ToolResult[] }> {
  const response = await fetch(`${API_URL}/api/agent/chat/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, context }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(err.error || `Request failed: ${response.status}`)
  }

  return response.json()
}
