import { prisma } from '../../lib/prisma.js'

export const profileTools = [
  {
    name: 'list_profiles',
    description: 'List all client profiles.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'get_profile',
    description: 'Get a profile and its uploaded documents.',
    input_schema: {
      type: 'object' as const,
      properties: {
        profile_id: { type: 'string', description: 'Profile ID' },
      },
      required: ['profile_id'],
    },
  },
  {
    name: 'create_profile',
    description: 'Create a new client profile.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Client name' },
        notes: { type: 'string', description: 'Optional notes' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_profile',
    description: 'Update a profile name or notes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        profile_id: { type: 'string', description: 'Profile ID' },
        name: { type: 'string', description: 'New name' },
        notes: { type: 'string', description: 'New notes' },
      },
      required: ['profile_id'],
    },
  },
]

export async function executeProfileTool(
  toolName: string,
  input: Record<string, any>,
  organizationId: string
): Promise<string> {
  switch (toolName) {
    case 'list_profiles': {
      const profiles = await prisma.profile.findMany({
        where: { organizationId },
        include: { documents: { select: { id: true, name: true, type: true, extractedText: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return JSON.stringify({ profiles })
    }

    case 'get_profile': {
      const profile = await prisma.profile.findFirst({
        where: { id: input.profile_id, organizationId },
        include: { documents: true, letters: true },
      })
      if (!profile) return JSON.stringify({ error: 'Profile not found' })
      return JSON.stringify(profile)
    }

    case 'create_profile': {
      const profile = await prisma.profile.create({
        data: { organizationId, name: input.name, notes: input.notes ?? null },
      })
      return JSON.stringify({ message: 'Profile created', profile })
    }

    case 'update_profile': {
      const existing = await prisma.profile.findFirst({ where: { id: input.profile_id, organizationId } })
      if (!existing) return JSON.stringify({ error: 'Profile not found' })
      const profile = await prisma.profile.update({
        where: { id: input.profile_id },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.notes !== undefined && { notes: input.notes }),
        },
      })
      return JSON.stringify({ message: 'Profile updated', profile })
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` })
  }
}
