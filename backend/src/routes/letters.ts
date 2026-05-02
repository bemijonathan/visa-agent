import { Hono } from 'hono'
import PDFDocument from 'pdfkit'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { organizationMiddleware, getOrganizationId } from '../middleware/organization.js'
import { executeLetterTool } from '../agent/tools/letter.js'
import { validate, GenerateLetterSchema } from '../lib/schemas.js'

export const letterRoutes = new Hono()

letterRoutes.use('*', authMiddleware)
letterRoutes.use('*', organizationMiddleware)

// Generate a letter using RAG
letterRoutes.post('/generate', async (c) => {
  const organizationId = getOrganizationId(c)

  const body = validate(GenerateLetterSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)
  const { profileId, name, instructions } = body.data

  // Verify profile belongs to org
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, organizationId },
  })
  if (!profile) return c.json({ error: 'Profile not found' }, 404)

  try {
    const result = await executeLetterTool(
      'generate_letter',
      { profile_id: profileId, name, instructions },
      organizationId
    )
    const data = JSON.parse(result)
    if (data.error) return c.json({ error: data.error }, 500)
    return c.json(data)
  } catch (error: any) {
    return c.json({ error: error.message || 'Generation failed' }, 500)
  }
})

// List letters for a profile
letterRoutes.get('/', async (c) => {
  const organizationId = getOrganizationId(c)
  const profileId = c.req.query('profileId')

  if (!profileId) {
    return c.json({ error: 'profileId query parameter is required' }, 400)
  }

  // Verify the profile belongs to this org
  const profile = await prisma.profile.findFirst({
    where: { id: profileId, organizationId },
  })

  if (!profile) {
    return c.json({ error: 'Profile not found' }, 404)
  }

  const letters = await prisma.letter.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(letters)
})

// Get a single letter
letterRoutes.get('/:id', async (c) => {
  const organizationId = getOrganizationId(c)
  const letterId = c.req.param('id')

  const letter = await prisma.letter.findFirst({
    where: {
      id: letterId,
      profile: { organizationId },
    },
    include: { profile: true },
  })

  if (!letter) {
    return c.json({ error: 'Letter not found' }, 404)
  }

  return c.json(letter)
})

// Download a letter as PDF
letterRoutes.get('/:id/pdf', async (c) => {
  const organizationId = getOrganizationId(c)
  const letterId = c.req.param('id')

  const letter = await prisma.letter.findFirst({
    where: { id: letterId, profile: { organizationId } },
    include: { profile: true },
  })

  if (!letter) return c.json({ error: 'Letter not found' }, 404)

  const chunks: Buffer[] = []
  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 72, size: 'A4' })
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', resolve)
    doc.on('error', reject)

    // Header
    doc.fontSize(11).font('Helvetica').text(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))
    doc.moveDown(2)

    // Body — preserve line breaks from the generated text
    doc.fontSize(11).font('Helvetica').text(letter.content, { lineGap: 4 })

    doc.end()
  })

  const pdf = Buffer.concat(chunks)
  const filename = `letter-${letter.profile.name.replace(/\s+/g, '-').toLowerCase()}.pdf`

  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdf.length),
    },
  })
})

// Update a letter (content and/or status)
letterRoutes.put('/:id', async (c) => {
  const organizationId = getOrganizationId(c)
  const letterId = c.req.param('id')

  const letter = await prisma.letter.findFirst({
    where: { id: letterId, profile: { organizationId } },
  })

  if (!letter) return c.json({ error: 'Letter not found' }, 404)

  const body = await c.req.json().catch(() => ({}))
  const { content, status } = body

  const data: { content?: string; status?: 'DRAFT' | 'APPROVED' | 'REJECTED' } = {}

  if (content !== undefined) {
    if (typeof content !== 'string' || content.length === 0) {
      return c.json({ error: 'content must be a non-empty string' }, 400)
    }
    data.content = content
  }

  if (status !== undefined) {
    if (!['DRAFT', 'APPROVED', 'REJECTED'].includes(status)) {
      return c.json({ error: 'status must be DRAFT, APPROVED, or REJECTED' }, 400)
    }
    data.status = status
  }

  if (Object.keys(data).length === 0) {
    return c.json({ error: 'content or status is required' }, 400)
  }

  const updated = await prisma.letter.update({
    where: { id: letterId },
    data,
  })

  return c.json(updated)
})

// Approve a letter
letterRoutes.post('/:id/approve', async (c) => {
  const organizationId = getOrganizationId(c)
  const letterId = c.req.param('id')

  const letter = await prisma.letter.findFirst({
    where: { id: letterId, profile: { organizationId } },
  })

  if (!letter) return c.json({ error: 'Letter not found' }, 404)

  const updated = await prisma.letter.update({
    where: { id: letterId },
    data: { status: 'APPROVED' },
  })

  return c.json(updated)
})

// Reject a letter
letterRoutes.post('/:id/reject', async (c) => {
  const organizationId = getOrganizationId(c)
  const letterId = c.req.param('id')

  const letter = await prisma.letter.findFirst({
    where: { id: letterId, profile: { organizationId } },
  })

  if (!letter) return c.json({ error: 'Letter not found' }, 404)

  const updated = await prisma.letter.update({
    where: { id: letterId },
    data: { status: 'REJECTED' },
  })

  return c.json(updated)
})

// Improve a letter with AI
letterRoutes.post('/:id/improve', async (c) => {
  const organizationId = getOrganizationId(c)
  const letterId = c.req.param('id')

  const letter = await prisma.letter.findFirst({
    where: { id: letterId, profile: { organizationId } },
  })

  if (!letter) return c.json({ error: 'Letter not found' }, 404)

  const body = await c.req.json().catch(() => ({}))
  const { instruction, currentContent } = body

  if (!instruction || typeof instruction !== 'string') {
    return c.json({ error: 'instruction is required' }, 400)
  }

  if (!currentContent || typeof currentContent !== 'string') {
    return c.json({ error: 'currentContent is required' }, 400)
  }

  try {
    const { groqComplete } = await import('../lib/groq.js')

    const prompt = `You are an expert letter editor. The user wants you to improve the following letter based on their instruction.

USER'S INSTRUCTION:
${instruction}

CURRENT LETTER:
${currentContent}

Please rewrite the letter incorporating the user's requested changes. Maintain the overall structure and format unless asked to change it. Output ONLY the improved letter text, nothing else.`

    const improvedContent = await groqComplete(prompt)

    return c.json({
      content: improvedContent.trim(),
      message: `I've updated the letter based on your instruction: "${instruction}"`,
    })
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to improve letter' }, 500)
  }
})

// Delete a letter
letterRoutes.delete('/:id', async (c) => {
  const organizationId = getOrganizationId(c)
  const letterId = c.req.param('id')

  const letter = await prisma.letter.findFirst({
    where: { id: letterId, profile: { organizationId } },
  })

  if (!letter) {
    return c.json({ error: 'Letter not found' }, 404)
  }

  await prisma.letter.delete({
    where: { id: letterId },
  })

  return c.json({ success: true })
})
