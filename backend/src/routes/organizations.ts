import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, getFirebaseUid, getUserEmail, getUserName, getUserPicture } from '../middleware/auth.js'
import { getOrCreateUser, organizationMiddleware, getUserId, getOrganizationId, getOrganizationRole, requireAdmin, requireOwner } from '../middleware/organization.js'
import { MemberRole } from '@prisma/client'
import { z } from 'zod'

export const organizationRoutes = new Hono()

// Apply auth middleware to all routes
organizationRoutes.use('*', authMiddleware)

// Schema validation
const CreateOrgSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
})

const UpdateOrgSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
})

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
})

// Helper to generate a unique slug
async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  let slug = baseSlug
  let counter = 1

  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

// List user's organizations (no org context needed)
organizationRoutes.get('/', async (c) => {
  const firebaseUid = getFirebaseUid(c)
  const email = getUserEmail(c)
  const displayName = getUserName(c)
  const photoURL = getUserPicture(c)

  const user = await getOrCreateUser(firebaseUid, email, displayName, photoURL)

  const memberships = await prisma.organizationMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        include: {
          _count: {
            select: { members: true, profiles: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  const organizations = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    role: m.role,
    memberCount: m.organization._count.members,
    profileCount: m.organization._count.profiles,
    createdAt: m.organization.createdAt,
  }))

  return c.json(organizations)
})

// Create a new organization (no org context needed)
organizationRoutes.post('/', async (c) => {
  const firebaseUid = getFirebaseUid(c)
  const email = getUserEmail(c)
  const displayName = getUserName(c)
  const photoURL = getUserPicture(c)

  const user = await getOrCreateUser(firebaseUid, email, displayName, photoURL)

  const body = await c.req.json().catch(() => ({}))
  const parsed = CreateOrgSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors.map(e => e.message).join(', ') }, 400)
  }

  // Check if slug is taken
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: parsed.data.slug },
  })

  if (existingOrg) {
    return c.json({ error: 'Organization slug is already taken' }, 400)
  }

  const organization = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      members: {
        create: {
          userId: user.id,
          role: MemberRole.OWNER,
        },
      },
    },
    include: {
      _count: { select: { members: true } },
    },
  })

  return c.json({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    role: MemberRole.OWNER,
    memberCount: organization._count.members,
  }, 201)
})

// Routes that require org context
const orgScopedRoutes = new Hono()
orgScopedRoutes.use('*', organizationMiddleware)

// Get organization details
orgScopedRoutes.get('/', async (c) => {
  const orgId = getOrganizationId(c)
  const role = getOrganizationRole(c)

  const organization = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, email: true, displayName: true, photoURL: true },
          },
        },
        orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
      },
      _count: { select: { profiles: true, documents: true } },
    },
  })

  if (!organization) {
    return c.json({ error: 'Organization not found' }, 404)
  }

  return c.json({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
    currentUserRole: role,
    members: organization.members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      email: m.user.email,
      displayName: m.user.displayName,
      photoURL: m.user.photoURL,
      role: m.role,
      createdAt: m.createdAt,
    })),
    profileCount: organization._count.profiles,
    documentCount: organization._count.documents,
    createdAt: organization.createdAt,
  })
})

// Update organization (admin/owner only)
orgScopedRoutes.put('/', requireAdmin, async (c) => {
  const orgId = getOrganizationId(c)

  const body = await c.req.json().catch(() => ({}))
  const parsed = UpdateOrgSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors.map(e => e.message).join(', ') }, 400)
  }

  const organization = await prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
    },
  })

  return c.json({
    id: organization.id,
    name: organization.name,
    slug: organization.slug,
  })
})

// Delete organization (owner only)
orgScopedRoutes.delete('/', requireOwner, async (c) => {
  const orgId = getOrganizationId(c)

  await prisma.organization.delete({
    where: { id: orgId },
  })

  return c.json({ success: true })
})

// Invite member (admin/owner only)
orgScopedRoutes.post('/invite', requireAdmin, async (c) => {
  const orgId = getOrganizationId(c)

  const body = await c.req.json().catch(() => ({}))
  const parsed = InviteSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors.map(e => e.message).join(', ') }, 400)
  }

  // Find or create user by email
  let user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (!user) {
    // Create a placeholder user - they'll get linked to their Firebase account on first sign in
    user = await prisma.user.create({
      data: {
        firebaseUid: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        email: parsed.data.email,
      },
    })
  }

  // Check if already a member
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: orgId,
      },
    },
  })

  if (existingMember) {
    return c.json({ error: 'User is already a member of this organization' }, 400)
  }

  const role = parsed.data.role === 'ADMIN' ? MemberRole.ADMIN : MemberRole.MEMBER

  const member = await prisma.organizationMember.create({
    data: {
      userId: user.id,
      organizationId: orgId,
      role,
    },
    include: {
      user: {
        select: { id: true, email: true, displayName: true, photoURL: true },
      },
    },
  })

  return c.json({
    id: member.id,
    userId: member.user.id,
    email: member.user.email,
    displayName: member.user.displayName,
    role: member.role,
    createdAt: member.createdAt,
  }, 201)
})

// Update member role (owner only, can't demote yourself)
orgScopedRoutes.put('/members/:memberId', requireOwner, async (c) => {
  const orgId = getOrganizationId(c)
  const userId = getUserId(c)
  const memberId = c.req.param('memberId')

  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId: orgId },
  })

  if (!member) {
    return c.json({ error: 'Member not found' }, 404)
  }

  // Can't change your own role
  if (member.userId === userId) {
    return c.json({ error: 'Cannot change your own role' }, 400)
  }

  const body = await c.req.json().catch(() => ({}))
  const role = body.role as string

  if (!['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
    return c.json({ error: 'Invalid role' }, 400)
  }

  const updated = await prisma.organizationMember.update({
    where: { id: memberId },
    data: { role: role as MemberRole },
    include: {
      user: {
        select: { id: true, email: true, displayName: true },
      },
    },
  })

  return c.json({
    id: updated.id,
    userId: updated.user.id,
    email: updated.user.email,
    displayName: updated.user.displayName,
    role: updated.role,
  })
})

// Remove member (admin/owner, can't remove yourself or owners)
orgScopedRoutes.delete('/members/:memberId', requireAdmin, async (c) => {
  const orgId = getOrganizationId(c)
  const userId = getUserId(c)
  const currentRole = getOrganizationRole(c)
  const memberId = c.req.param('memberId')

  const member = await prisma.organizationMember.findFirst({
    where: { id: memberId, organizationId: orgId },
  })

  if (!member) {
    return c.json({ error: 'Member not found' }, 404)
  }

  // Can't remove yourself via this endpoint
  if (member.userId === userId) {
    return c.json({ error: 'Use the leave endpoint to remove yourself' }, 400)
  }

  // Admins can't remove owners
  if (currentRole === MemberRole.ADMIN && member.role === MemberRole.OWNER) {
    return c.json({ error: 'Cannot remove an owner' }, 403)
  }

  await prisma.organizationMember.delete({
    where: { id: memberId },
  })

  return c.json({ success: true })
})

// Leave organization (any member)
orgScopedRoutes.post('/leave', async (c) => {
  const orgId = getOrganizationId(c)
  const userId = getUserId(c)
  const role = getOrganizationRole(c)

  // If owner, check if there's another owner
  if (role === MemberRole.OWNER) {
    const otherOwners = await prisma.organizationMember.count({
      where: {
        organizationId: orgId,
        role: MemberRole.OWNER,
        userId: { not: userId },
      },
    })

    if (otherOwners === 0) {
      return c.json({ error: 'Cannot leave: you are the only owner. Transfer ownership or delete the organization.' }, 400)
    }
  }

  await prisma.organizationMember.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId: orgId,
      },
    },
  })

  return c.json({ success: true })
})

// Mount org-scoped routes under /:id
organizationRoutes.route('/:id', orgScopedRoutes)
