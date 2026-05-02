import { GoogleGenerativeAI } from '@google/generative-ai'
import { profileTools, executeProfileTool } from './tools/profile.js'
import { documentTools, executeDocumentTool } from './tools/document.js'
import { formTools, executeFormTool } from './tools/form.js'
import { letterTools, executeLetterTool } from './tools/letter.js'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

// Convert Anthropic input_schema format to Gemini schema format
function toGeminiSchema(schema: any): any {
  if (!schema) return undefined
  const result: any = { type: schema.type?.toUpperCase() }
  if (schema.description) result.description = schema.description
  if (schema.properties) {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([k, v]) => [k, toGeminiSchema(v)])
    )
  }
  if (schema.required) result.required = schema.required
  if (schema.items) result.items = toGeminiSchema(schema.items)
  if (schema.enum) result.enum = schema.enum
  return result
}

const allTools = [
  ...profileTools,
  ...documentTools,
  ...formTools,
  ...letterTools,
]

const geminiTools = [{
  functionDeclarations: allTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: toGeminiSchema(tool.input_schema),
  })),
}]

const SYSTEM_PROMPT = `You are a helpful visa application assistant. Your role is to help users:

1. **Manage Profiles**: Create and update profiles with personal information, passport details, employment, education, and travel history.

2. **Process Documents**: Help users upload and extract information from documents like passports, bank statements, booking confirmations, and itineraries.

3. **Fill Visa Forms**: Analyze form fields on visa application websites and fill them with the appropriate information from the user's profile and documents.

4. **Generate Letters**: Create professional cover letters, invitation letters, and employer support letters for visa applications.

## Guidelines:

- Always be helpful and guide users through the visa application process
- When creating profiles, ask for required information if not provided
- When filling forms, always confirm with the user before proceeding
- When generating letters, ask for any missing details
- Be aware of common visa requirements and best practices
- Keep information accurate and consistent across all documents
- Protect user privacy - never share sensitive information unnecessarily

## Available Tools:

You have access to tools for:
- Profile management (list_profiles, get_profile, create_profile, update_profile)
- Document processing (list_documents, extract_document_text, search_documents)
- Form filling (detect_form_fields, fill_form_fields)
- Letter generation (generate_cover_letter, generate_invitation_letter, generate_employer_letter, list_letters)

Use these tools proactively to help users accomplish their visa-related tasks.`

async function executeTool(
  toolName: string,
  input: Record<string, any>,
  organizationId: string
): Promise<string> {
  if (profileTools.some(t => t.name === toolName)) {
    return executeProfileTool(toolName, input, organizationId)
  }
  if (documentTools.some(t => t.name === toolName)) {
    return executeDocumentTool(toolName, input, organizationId)
  }
  if (formTools.some(t => t.name === toolName)) {
    return executeFormTool(toolName, input, organizationId)
  }
  if (letterTools.some(t => t.name === toolName)) {
    return executeLetterTool(toolName, input, organizationId)
  }
  return JSON.stringify({ error: `Unknown tool: ${toolName}` })
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentResponse {
  content: string
  toolCalls?: Array<{
    name: string
    input: Record<string, any>
    result: string
  }>
}

export async function* runAgent(
  messages: ChatMessage[],
  organizationId: string,
  context?: { pageHtml?: string }
): AsyncGenerator<{ type: 'text' | 'tool_use' | 'tool_result' | 'done'; content: string }> {
  const processedMessages = messages.map((msg, index) => {
    if (index === messages.length - 1 && msg.role === 'user' && context?.pageHtml) {
      return {
        ...msg,
        content: `${msg.content}\n\n[Current page HTML for form detection]:\n${context.pageHtml.slice(0, 50000)}`,
      }
    }
    return msg
  })

  // Gemini uses 'model' instead of 'assistant', and history excludes the last message
  const history = processedMessages.slice(0, -1).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const lastMessage = processedMessages[processedMessages.length - 1]

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-pro',
    systemInstruction: SYSTEM_PROMPT,
    tools: geminiTools as any,
  })

  const chat = model.startChat({ history })

  // Stream initial response
  const streamResult = await chat.sendMessageStream(lastMessage.content)

  let fullText = ''
  for await (const chunk of streamResult.stream) {
    const text = chunk.text()
    if (text) {
      fullText += text
      yield { type: 'text', content: text }
    }
  }

  let response = await streamResult.response

  // Agentic tool-calling loop
  while (response.functionCalls()?.length) {
    const functionCalls = response.functionCalls()!

    const functionResponseParts: any[] = []

    for (const fc of functionCalls) {
      yield { type: 'tool_use', content: JSON.stringify({ name: fc.name, input: fc.args }) }

      const result = await executeTool(fc.name, fc.args as Record<string, any>, organizationId)
      yield { type: 'tool_result', content: JSON.stringify({ name: fc.name, result }) }

      let parsedResult: any
      try {
        parsedResult = JSON.parse(result)
      } catch {
        parsedResult = { output: result }
      }

      functionResponseParts.push({
        functionResponse: { name: fc.name, response: parsedResult },
      })
    }

    // Send tool results back and stream the next response
    const nextStream = await chat.sendMessageStream(functionResponseParts)

    for await (const chunk of nextStream.stream) {
      const text = chunk.text()
      if (text) {
        fullText += text
        yield { type: 'text', content: text }
      }
    }

    response = await nextStream.response
  }

  yield { type: 'done', content: fullText }
}

// Non-streaming version for simple use cases
export async function chat(
  messages: ChatMessage[],
  organizationId: string,
  context?: { pageHtml?: string }
): Promise<AgentResponse> {
  let fullContent = ''
  const toolCalls: AgentResponse['toolCalls'] = []

  for await (const event of runAgent(messages, organizationId, context)) {
    if (event.type === 'text') {
      fullContent += event.content
    } else if (event.type === 'tool_use') {
      const parsed = JSON.parse(event.content)
      toolCalls!.push({ name: parsed.name, input: parsed.input, result: '' })
    } else if (event.type === 'tool_result') {
      const parsed = JSON.parse(event.content)
      const lastTool = toolCalls!.find(t => t.name === parsed.name && !t.result)
      if (lastTool) lastTool.result = parsed.result
    }
  }

  return { content: fullContent, toolCalls }
}
