import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { authMiddleware } from '../middleware/auth.js'
import { organizationMiddleware, getOrganizationId } from '../middleware/organization.js'
import { validate, CreateProfileSchema, UpdateProfileSchema } from '../lib/schemas.js'

export const profileRoutes = new Hono()

profileRoutes.use('*', authMiddleware)
profileRoutes.use('*', organizationMiddleware)

profileRoutes.get('/', async (c) => {
  const organizationId = getOrganizationId(c)

  const profiles = await prisma.profile.findMany({
    where: { organizationId },
    include: { documents: { select: { id: true, name: true, type: true, extractedText: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(profiles)
})

profileRoutes.get('/:id', async (c) => {
  const organizationId = getOrganizationId(c)

  const profile = await prisma.profile.findFirst({
    where: { id: c.req.param('id'), organizationId },
    include: {
      documents: true,
      letters: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!profile) return c.json({ error: 'Profile not found' }, 404)
  return c.json(profile)
})

profileRoutes.post('/', async (c) => {
  const organizationId = getOrganizationId(c)

  const body = validate(CreateProfileSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)

  const profile = await prisma.profile.create({
    data: { organizationId, name: body.data.name, notes: body.data.notes ?? null },
  })

  return c.json(profile, 201)
})

profileRoutes.put('/:id', async (c) => {
  const organizationId = getOrganizationId(c)

  const existing = await prisma.profile.findFirst({
    where: { id: c.req.param('id'), organizationId },
  })

  if (!existing) return c.json({ error: 'Profile not found' }, 404)

  const body = validate(UpdateProfileSchema, await c.req.json().catch(() => ({})))
  if (body.error) return c.json({ error: body.error }, 400)

  const { name, notes, dateOfBirth, nationality, passportNumber, passportExpiry, address, city, country, phone, email, occupation, employer } = body.data

  const profile = await prisma.profile.update({
    where: { id: existing.id },
    data: {
      ...(name !== undefined && { name }),
      ...(notes !== undefined && { notes }),
      ...(dateOfBirth !== undefined && { dateOfBirth }),
      ...(nationality !== undefined && { nationality }),
      ...(passportNumber !== undefined && { passportNumber }),
      ...(passportExpiry !== undefined && { passportExpiry }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(country !== undefined && { country }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(occupation !== undefined && { occupation }),
      ...(employer !== undefined && { employer }),
    },
  })

  return c.json(profile)
})

profileRoutes.delete('/:id', async (c) => {
  const organizationId = getOrganizationId(c)

  const existing = await prisma.profile.findFirst({
    where: { id: c.req.param('id'), organizationId },
  })

  if (!existing) return c.json({ error: 'Profile not found' }, 404)

  await prisma.profile.delete({ where: { id: existing.id } })
  return c.json({ success: true })
})
