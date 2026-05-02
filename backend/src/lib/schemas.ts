import { z } from 'zod'

// Profiles
export const CreateProfileSchema = z.object({
  name: z.string().min(1, 'name is required').max(200).trim(),
  notes: z.string().max(2000).optional(),
})

export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  notes: z.string().max(2000).nullable().optional(),
  // Biodata fields
  dateOfBirth: z.string().max(20).nullable().optional(),
  nationality: z.string().max(100).nullable().optional(),
  passportNumber: z.string().max(50).nullable().optional(),
  passportExpiry: z.string().max(20).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  country: z.string().max(100).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  email: z.string().max(200).nullable().optional(),
  occupation: z.string().max(200).nullable().optional(),
  employer: z.string().max(200).nullable().optional(),
})

// Agent
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(100_000),
})

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema).min(1).max(100),
  context: z.object({
    pageHtml: z.string().max(500_000).optional(),
  }).optional(),
})

export const FillFormSchema = z.object({
  profileId: z.string().min(1),
  fields: z.array(z.object({
    selector: z.string().min(1),
    label: z.string(),
    type: z.string(),
    options: z.array(z.string()).optional(),
  })).min(1).max(200),
})

export const ProfileChatSchema = z.object({
  profileId: z.string().min(1),
  message: z.string().min(1).max(10_000),
  history: z.array(ChatMessageSchema).max(50).optional(),
})

// Letters
export const GenerateLetterSchema = z.object({
  profileId: z.string().min(1),
  name: z.string().min(1, 'Letter name is required').max(200).trim(),
  instructions: z.string().min(1, 'Instructions are required').max(5000).trim(),
})

// Utility: parse and return 400 on failure
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { data: null, error: message }
  }
  return { data: result.data, error: null }
}
