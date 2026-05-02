import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { organizationMiddleware, getOrganizationId, getUserId } from '../middleware/organization.js'
import { runAgent, ChatMessage } from '../agent/index.js'
import { executeFormTool } from '../agent/tools/form.js'
import { executeLetterTool } from '../agent/tools/letter.js'
import { validate, ChatRequestSchema, FillFormSchema, GenerateLetterSchema, ProfileChatSchema } from '../lib/schemas.js'

export const agentRoutes = new Hono()

agentRoutes.use('*', authMiddleware)
agentRoutes.use('*', organizationMiddleware)

// Streaming chat endpoint
agentRoutes.post('/chat', async (c) => {
  const organizationId = getOrganizationId(c)
  const userId = getUserId(c)

  const body = validate(ChatRequestSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)

  const { messages, context } = body.data

  await prisma.activity.create({
    data: {
      userId,
      type: 'chat',
      description: `Chat message: ${messages[messages.length - 1]?.content?.slice(0, 100)}...`,
      metadata: { hasPageContext: !!context?.pageHtml },
    },
  }).catch(() => {}) // Don't fail if activity logging fails

  return streamSSE(c, async (stream) => {
    try {
      for await (const event of runAgent(messages as ChatMessage[], organizationId, context)) {
        await stream.writeSSE({ event: event.type, data: event.content })
      }
    } catch (error: any) {
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({ error: 'Agent error' }),
      })
    }
  })
})

// Non-streaming chat endpoint
agentRoutes.post('/chat/sync', async (c) => {
  const organizationId = getOrganizationId(c)

  const body = validate(ChatRequestSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)

  const { messages, context } = body.data

  try {
    let fullContent = ''
    const toolCalls: Array<{ name: string; input: any; result: string }> = []

    for await (const event of runAgent(messages as ChatMessage[], organizationId, context)) {
      if (event.type === 'text') {
        fullContent += event.content
      } else if (event.type === 'tool_use') {
        const parsed = JSON.parse(event.content)
        toolCalls.push({ name: parsed.name, input: parsed.input, result: '' })
      } else if (event.type === 'tool_result') {
        const parsed = JSON.parse(event.content)
        const lastTool = toolCalls.find(t => t.name === parsed.name && !t.result)
        if (lastTool) lastTool.result = parsed.result
      }
    }

    return c.json({ content: fullContent, toolCalls })
  } catch (error: any) {
    return c.json({ error: 'Agent error' }, 500)
  }
})

// Fill form endpoint (non-streaming, for extension)
agentRoutes.post('/fill-form', async (c) => {
  const organizationId = getOrganizationId(c)

  const body = validate(FillFormSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)

  const { profileId, fields } = body.data

  // Verify profile belongs to org
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, organizationId },
  })
  if (!profile) return c.json({ error: 'Profile not found' }, 404)

  try {
    const fillResult = await executeFormTool(
      'fill_form_fields',
      { fields, profile_id: profileId },
      organizationId
    )
    const fillData = JSON.parse(fillResult)
    return c.json({ fieldValues: fillData.fieldValues ?? [] })
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to fill form' }, 500)
  }
})

// Generate letter endpoint (for extension)
agentRoutes.post('/generate-letter', async (c) => {
  const organizationId = getOrganizationId(c)

  const body = validate(GenerateLetterSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)

  const { profileId, instructions } = body.data

  // Verify profile belongs to org
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, organizationId },
  })
  if (!profile) return c.json({ error: 'Profile not found' }, 404)

  try {
    const result = await executeLetterTool(
      'generate_letter',
      { profile_id: profileId, instructions: instructions || '', type: 'custom' },
      organizationId
    )
    const data = JSON.parse(result)
    if (data.error) return c.json({ error: data.error }, 500)
    return c.json({ letterId: data.letterId, letter: data.content })
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to generate letter' }, 500)
  }
})

// Profile-scoped chat endpoint (for dashboard)
agentRoutes.post('/profile-chat', async (c) => {
  const organizationId = getOrganizationId(c)

  const body = validate(ProfileChatSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)

  const { profileId, message, history = [] } = body.data

  // Verify profile belongs to org
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, organizationId },
  })
  if (!profile) return c.json({ error: 'Profile not found' }, 404)

  // Build messages with profile context prepended to the user message
  const contextualMessage = `[Context: You are answering questions about the client profile with ID "${profileId}". Use the search_documents and get_profile tools to find relevant information from their uploaded documents. Always search for relevant documents before answering.]\n\nUser question: ${message}`

  const messages: ChatMessage[] = [
    ...history,
    { role: 'user', content: contextualMessage },
  ]

  try {
    let fullContent = ''
    for await (const event of runAgent(messages, organizationId)) {
      if (event.type === 'text') {
        fullContent += event.content
      }
    }
    return c.json({ response: fullContent })
  } catch (error: any) {
    return c.json({ error: error.message || 'Chat failed' }, 500)
  }
})
