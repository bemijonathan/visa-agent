import { prisma } from '../../lib/prisma.js'
import { groqComplete } from '../../lib/groq.js'
import { executeDocumentTool } from './document.js'

export const letterTools = [
  {
    name: 'generate_letter',
    description: 'Generate a letter based on instructions by pulling information from the client\'s uploaded documents via RAG.',
    input_schema: {
      type: 'object' as const,
      properties: {
        profile_id: {
          type: 'string',
          description: 'The profile ID of the applicant',
        },
        name: {
          type: 'string',
          description: 'Name/title of the letter',
        },
        instructions: {
          type: 'string',
          description: 'Instructions for generating the letter',
        },
      },
      required: ['profile_id', 'name', 'instructions'],
    },
  },
  {
    name: 'list_letters',
    description: 'List all generated letters for a profile.',
    input_schema: {
      type: 'object' as const,
      properties: {
        profile_id: {
          type: 'string',
          description: 'The profile ID to list letters for',
        },
      },
      required: ['profile_id'],
    },
  },
]

export async function executeLetterTool(
  toolName: string,
  input: Record<string, any>,
  organizationId: string
): Promise<string> {
  switch (toolName) {
    case 'generate_letter': {
      const profile = await prisma.profile.findFirst({
        where: { id: input.profile_id, organizationId },
      })

      if (!profile) {
        return JSON.stringify({ error: 'Profile not found' })
      }

      const instructions: string = input.instructions || ''
      const letterName: string = input.name || 'Letter'

      // Search documents for relevant information based on instructions
      const searchQuery = `${instructions} name passport travel dates employment address`

      const searchResult = await executeDocumentTool(
        'search_documents',
        { query: searchQuery, profile_id: input.profile_id, limit: 10 },
        organizationId
      )
      const searchData = JSON.parse(searchResult)
      const documentContext = searchData.results?.map((r: any) =>
        `[${r.documentName} - ${r.documentType}]\n${r.text}`
      ).join('\n\n') || 'No documents found for this profile.'

      const prompt = `Generate a professional letter based on the following instructions:

${instructions}

IMPORTANT GUIDELINES:
- Write in FIRST PERSON perspective (I, my, me) as the applicant/client unless the instructions specify otherwise
- Address the letter to "The Visa Officer" at the Embassy/Consulate unless instructions specify a different recipient
- Use today's date at the top of the letter
- Use formal business letter format
- Extract ALL relevant information from the document extracts below
- Leave a [PLACEHOLDER] for any critical detail that cannot be found in the documents
- Include a proper salutation (e.g., "Dear Visa Officer,") and closing (e.g., "Yours faithfully,")
- End with a signature line for the applicant's name`

      try {
        const fullPrompt = `${prompt}

CLIENT NAME: ${profile.name}

DOCUMENT EXTRACTS:
${documentContext}`

        const letterContent = await groqComplete(fullPrompt)

        const letter = await prisma.letter.create({
          data: {
            profileId: input.profile_id,
            name: letterName,
            instructions: instructions,
            content: letterContent,
            metadata: {},
          },
        })

        return JSON.stringify({
          message: `Letter "${letterName}" generated successfully`,
          letterId: letter.id,
          content: letterContent,
        })
      } catch (error: any) {
        return JSON.stringify({ error: `Failed to generate letter: ${error.message}` })
      }
    }

    case 'list_letters': {
      const letters = await prisma.letter.findMany({
        where: {
          profileId: input.profile_id,
          profile: { organizationId },
        },
        select: { id: true, name: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })

      return JSON.stringify({ message: `Found ${letters.length} letter(s).`, letters })
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` })
  }
}
