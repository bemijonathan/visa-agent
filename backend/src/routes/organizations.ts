import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { authMiddleware, getFirebaseUid, getUserEmail, getUserName, getUserPicture } from '../middleware/auth.js'
import { getOrCreateUser, organizationMiddleware, getUserId, getOrganizationId, getOrganizationRole, requireAdmin, requireOwner } from '../middleware/organization.js'
import { MemberRole, InvitationStatus } from '@prisma/client'
import { z } from 'zod'
import { randomBytes } from 'crypto'
import { sendInviteEmail } from '../lib/email.js'

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
  const userId = getUserId(c)

  const body = await c.req.json().catch(() => ({}))
  const parsed = InviteSchema.safeParse(body)

  if (!parsed.success) {
    return c.json({ error: parsed.error.errors.map(e => e.message).join(', ') }, 400)
  }

  const email = parsed.data.email.toLowerCase()
  const role = parsed.data.role === 'ADMIN' ? MemberRole.ADMIN : MemberRole.MEMBER

  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        where: { organizationId: orgId },
      },
    },
  })

  if (existingUser?.memberships.length) {
    return c.json({ error: 'User is already a member of this organization' }, 400)
  }

  // Check for existing pending invitation
  const existingInvite = await prisma.invitation.findUnique({
    where: {
      email_organizationId: {
        email,
        organizationId: orgId,
      },
    },
  })

  if (existingInvite?.status === InvitationStatus.PENDING) {
    return c.json({ error: 'An invitation has already been sent to this email' }, 400)
  }

  // Get organization and inviter details for email
  const [organization, inviter] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])

  if (!organization || !inviter) {
    return c.json({ error: 'Organization or user not found' }, 404)
  }

  // Generate unique token
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Create or update invitation
  const invitation = await prisma.invitation.upsert({
    where: {
      email_organizationId: {
        email,
        organizationId: orgId,
      },
    },
    create: {
      email,
      organizationId: orgId,
      role,
      token,
      expiresAt,
      invitedById: userId,
    },
    update: {
      role,
      token,
      status: InvitationStatus.PENDING,
      expiresAt,
      invitedById: userId,
    },
  })

  // Send invitation email
  try {
    await sendInviteEmail({
      to: email,
      inviterName: inviter.displayName || inviter.email,
      organizationName: organization.name,
      token,
      role: role === MemberRole.ADMIN ? 'Admin' : 'Member',
    })
  } catch (error: any) {
    // Delete the invitation if email fails
    await prisma.invitation.delete({ where: { id: invitation.id } })
    console.error('Email send error:', error)
    return c.json({ error: 'Failed to send invitation email. Please try again.' }, 500)
  }

  return c.json({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
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

// List pending invitations (admin/owner only)
orgScopedRoutes.get('/invitations', requireAdmin, async (c) => {
  const orgId = getOrganizationId(c)

  const invitations = await prisma.invitation.findMany({
    where: {
      organizationId: orgId,
      status: InvitationStatus.PENDING,
    },
    include: {
      invitedBy: {
        select: { displayName: true, email: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(invitations.map(inv => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    invitedBy: inv.invitedBy.displayName || inv.invitedBy.email,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
  })))
})

// Cancel invitation (admin/owner only)
orgScopedRoutes.delete('/invitations/:invitationId', requireAdmin, async (c) => {
  const orgId = getOrganizationId(c)
  const invitationId = c.req.param('invitationId')

  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, organizationId: orgId },
  })

  if (!invitation) {
    return c.json({ error: 'Invitation not found' }, 404)
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.CANCELLED },
  })

  return c.json({ success: true })
})

// Mount org-scoped routes under /:id
organizationRoutes.route('/:id', orgScopedRoutes)

// Accept invitation (no org context needed, uses token)
organizationRoutes.post('/invitations/:token/accept', async (c) => {
  const firebaseUid = getFirebaseUid(c)
  const email = getUserEmail(c)
  const displayName = getUserName(c)
  const photoURL = getUserPicture(c)
  const token = c.req.param('token')

  // Find the invitation
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  })

  if (!invitation) {
    return c.json({ error: 'Invitation not found' }, 404)
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    return c.json({ error: `Invitation has already been ${invitation.status.toLowerCase()}` }, 400)
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.EXPIRED },
    })
    return c.json({ error: 'Invitation has expired' }, 400)
  }

  // Email must match (case insensitive)
  if (email.toLowerCase() !== invitation.email.toLowerCase()) {
    return c.json({
      error: `This invitation was sent to ${invitation.email}. Please sign in with that email address.`
    }, 403)
  }

  // Get or create user
  const user = await getOrCreateUser(firebaseUid, email, displayName, photoURL)

  // Check if already a member
  const existingMember = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: invitation.organizationId,
      },
    },
  })

  if (existingMember) {
    // Mark invitation as accepted anyway
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    })
    return c.json({
      message: 'You are already a member of this organization',
      organizationId: invitation.organizationId,
      organizationName: invitation.organization.name,
    })
  }

  // Add user as member and mark invitation as accepted
  await prisma.$transaction([
    prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED },
    }),
  ])

  return c.json({
    message: 'Invitation accepted',
    organizationId: invitation.organizationId,
    organizationName: invitation.organization.name,
    role: invitation.role,
  })
})

// Get invitation details (public, for showing invite page)
organizationRoutes.get('/invitations/:token', async (c) => {
  const token = c.req.param('token')

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      organization: { select: { name: true, slug: true } },
      invitedBy: { select: { displayName: true } },
    },
  })

  if (!invitation) {
    return c.json({ error: 'Invitation not found' }, 404)
  }

  const isExpired = new Date() > invitation.expiresAt

  return c.json({
    email: invitation.email,
    organizationName: invitation.organization.name,
    organizationSlug: invitation.organization.slug,
    invitedBy: invitation.invitedBy.displayName || 'A team member',
    role: invitation.role,
    status: isExpired ? 'EXPIRED' : invitation.status,
    expiresAt: invitation.expiresAt,
  })
})
