import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { organizationMiddleware, getOrganizationId, getUserId } from '../middleware/organization.js'
import { saveFile, removeFile } from '../lib/storage.js'
import { executeDocumentTool } from '../agent/tools/document.js'

export const documentRoutes = new Hono()

documentRoutes.use('*', authMiddleware)
documentRoutes.use('*', organizationMiddleware)

documentRoutes.get('/', async (c) => {
  const organizationId = getOrganizationId(c)

  const documents = await prisma.document.findMany({
    where: { organizationId },
    include: {
      uploadedBy: {
        select: { id: true, email: true, displayName: true },
      },
      profile: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(documents)
})

documentRoutes.post('/upload', async (c) => {
  const organizationId = getOrganizationId(c)
  const userId = getUserId(c)

  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'other'
    const profileId = formData.get('profileId') as string | null
    const name = (formData.get('name') as string) || file?.name

    if (!file) return c.json({ error: 'No file provided' }, 400)

    // Verify profile belongs to org if provided
    if (profileId) {
      const profile = await prisma.profile.findFirst({
        where: { id: profileId, organizationId },
      })
      if (!profile) {
        return c.json({ error: 'Profile not found or not in this organization' }, 400)
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { fileId, fileUrl } = await saveFile(buffer, file.name)

    const document = await prisma.document.create({
      data: {
        organizationId,
        uploadedById: userId,
        profileId: profileId || null,
        type,
        name,
        fileId,
        fileUrl,
      },
    })

    return c.json({ documentId: document.id, fileUrl: document.fileUrl }, 201)
  } catch (error: any) {
    console.error('Upload error:', error)
    return c.json({ error: error.message || 'Upload failed' }, 500)
  }
})

documentRoutes.get('/:id', async (c) => {
  const organizationId = getOrganizationId(c)
  const documentId = c.req.param('id')

  const document = await prisma.document.findFirst({
    where: { id: documentId, organizationId },
    include: {
      uploadedBy: {
        select: { id: true, email: true, displayName: true },
      },
    },
  })

  if (!document) return c.json({ error: 'Document not found' }, 404)

  return c.json(document)
})

documentRoutes.post('/:id/extract', async (c) => {
  const organizationId = getOrganizationId(c)
  const documentId = c.req.param('id')

  const document = await prisma.document.findFirst({
    where: { id: documentId, organizationId },
  })

  if (!document) return c.json({ error: 'Document not found' }, 404)

  try {
    const result = await executeDocumentTool(
      'extract_document_text',
      { document_id: documentId },
      organizationId
    )
    const parsed = JSON.parse(result)

    if (parsed.error) {
      return c.json({ error: parsed.error }, 400)
    }

    return c.json(parsed)
  } catch (error: any) {
    console.error('Extract error:', error)
    return c.json({ error: error.message || 'Extraction failed' }, 500)
  }
})

documentRoutes.delete('/:id', async (c) => {
  const organizationId = getOrganizationId(c)
  const documentId = c.req.param('id')

  const document = await prisma.document.findFirst({
    where: { id: documentId, organizationId },
  })

  if (!document) return c.json({ error: 'Document not found' }, 404)

  await removeFile(document.fileId).catch(() => {})
  await prisma.document.delete({ where: { id: documentId } })

  return c.json({ success: true })
})
