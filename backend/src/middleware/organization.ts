import { Context, Next } from 'hono'
import { prisma } from '../lib/prisma.js'
import { getFirebaseUid, getUserEmail, getUserName, getUserPicture } from './auth.js'
import { MemberRole } from '@prisma/client'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const DEV_FIREBASE_UID = 'dev-user'
const IS_DEV_MODE =
  !IS_PRODUCTION &&
  (!process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT === '{}')

export async function getOrCreateUser(firebaseUid: string, email?: string | null, displayName?: string | null, photoURL?: string | null) {
  return prisma.user.upsert({
    where: { firebaseUid },
    update: {
      ...(email && { email }),
      ...(displayName && { displayName }),
      ...(photoURL && { photoURL }),
    },
    create: {
      firebaseUid,
      email: email || `${firebaseUid}@placeholder.com`,
      displayName,
      photoURL,
    },
  })
}

export async function organizationMiddleware(c: Context, next: Next) {
  const firebaseUid = getFirebaseUid(c)
  const email = getUserEmail(c)
  const displayName = getUserName(c)
  const photoURL = getUserPicture(c)

  // Get or create user
  const user = await getOrCreateUser(firebaseUid, email, displayName, photoURL)
  c.set('userId', user.id)
  c.set('user', user)

  // Get organization ID from header
  const orgId = c.req.header('X-Organization-ID')

  // In dev mode without org header, auto-create/select a dev org
  if (IS_DEV_MODE && !orgId) {
    const devOrg = await getOrCreateDevOrganization(user.id)
    c.set('organizationId', devOrg.id)
    c.set('organizationRole', MemberRole.OWNER)
    await next()
    return
  }

  if (!orgId) {
    return c.json({ error: 'Missing X-Organization-ID header' }, 400)
  }

  // Verify user is a member of the organization
  const membership = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: orgId,
      },
    },
    include: {
      organization: true,
    },
  })

  if (!membership) {
    return c.json({ error: 'Not a member of this organization' }, 403)
  }

  c.set('organizationId', orgId)
  c.set('organizationRole', membership.role)
  c.set('organization', membership.organization)

  await next()
}

// Helper to create dev organization for testing
async function getOrCreateDevOrganization(userId: string) {
  const existingMembership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  })

  if (existingMembership) {
    return existingMembership.organization
  }

  // Create a new organization for this dev user
  const org = await prisma.organization.create({
    data: {
      name: 'Dev Organization',
      slug: `dev-org-${userId.slice(0, 8)}`,
      members: {
        create: {
          userId,
          role: MemberRole.OWNER,
        },
      },
    },
  })

  return org
}

// Middleware that requires admin or owner role
export async function requireAdmin(c: Context, next: Next) {
  const role = c.get('organizationRole') as MemberRole
  if (role !== MemberRole.ADMIN && role !== MemberRole.OWNER) {
    return c.json({ error: 'Admin access required' }, 403)
  }
  await next()
}

// Middleware that requires owner role
export async function requireOwner(c: Context, next: Next) {
  const role = c.get('organizationRole') as MemberRole
  if (role !== MemberRole.OWNER) {
    return c.json({ error: 'Owner access required' }, 403)
  }
  await next()
}

// Helper functions to get context values
export function getUserId(c: Context): string {
  return c.get('userId')
}

export function getOrganizationId(c: Context): string {
  return c.get('organizationId')
}

export function getOrganizationRole(c: Context): MemberRole {
  return c.get('organizationRole')
}
