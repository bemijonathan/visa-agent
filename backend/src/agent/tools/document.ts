import { prisma } from '../../lib/prisma.js'
import { extractTextFromImage } from '../../lib/gemini.js'

// Tool definitions for Claude
export const documentTools = [
  {
    name: 'list_documents',
    description: 'List all documents uploaded by the organization.',
    input_schema: {
      type: 'object' as const,
      properties: {
        profile_id: {
          type: 'string',
          description: 'Optional: Filter documents by profile ID',
        },
      },
      required: [],
    },
  },
  {
    name: 'extract_document_text',
    description: 'Extract text from a document using OCR/Vision AI. This processes the document and stores the extracted text for later search.',
    input_schema: {
      type: 'object' as const,
      properties: {
        document_id: {
          type: 'string',
          description: 'The ID of the document to process',
        },
      },
      required: ['document_id'],
    },
  },
  {
    name: 'search_documents',
    description: 'Search through processed documents using semantic search. Returns relevant text chunks that match the query.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query to find relevant information',
        },
        profile_id: {
          type: 'string',
          description: 'Optional: Filter search to a specific profile',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 5)',
        },
      },
      required: ['query'],
    },
  },
]

// Tool implementations
export async function executeDocumentTool(
  toolName: string,
  input: Record<string, any>,
  organizationId: string
): Promise<string> {
  switch (toolName) {
    case 'list_documents': {
      const whereClause: any = { organizationId }
      if (input.profile_id) {
        whereClause.profileId = input.profile_id
      }

      const documents = await prisma.document.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          type: true,
          fileUrl: true,
          extractedText: true,
          createdAt: true,
          profile: {
            select: { name: true },
          },
        },
      })

      if (documents.length === 0) {
        return JSON.stringify({
          message: 'No documents found. Upload documents through the extension or API.',
          documents: [],
        })
      }

      return JSON.stringify({
        message: `Found ${documents.length} document(s).`,
        documents: documents.map(d => ({
          ...d,
          hasExtractedText: !!d.extractedText,
          extractedText: undefined, // Don't include full text in list
        })),
      })
    }

    case 'extract_document_text': {
      const document = await prisma.document.findFirst({
        where: {
          id: input.document_id,
          organizationId,
        },
      })

      if (!document) {
        return JSON.stringify({ error: 'Document not found' })
      }

      if (document.extractedText) {
        return JSON.stringify({
          message: 'Document already processed',
          documentId: document.id,
          extractedText: document.extractedText,
        })
      }

      try {
        // Extract text using Gemini Vision
        const extractedText = await extractTextFromImage(document.fileUrl)

        // Update document with extracted text
        await prisma.document.update({
          where: { id: document.id },
          data: {
            extractedText,
          },
        })

        return JSON.stringify({
          message: 'Document processed successfully',
          documentId: document.id,
          extractedText,
        })
      } catch (error: any) {
        return JSON.stringify({ error: `Failed to process document: ${error.message}` })
      }
    }

    case 'search_documents': {
      try {
        const whereClause: any = {
          organizationId,
          extractedText: { not: null },
        }
        if (input.profile_id) {
          whereClause.profileId = input.profile_id
        }

        const documents = await prisma.document.findMany({
          where: whereClause,
          select: { name: true, type: true, extractedText: true },
        })

        if (documents.length === 0) {
          return JSON.stringify({
            message: 'No processed documents found for this profile. Upload and process documents first.',
            results: [],
          })
        }

        // Return each document as a result chunk — Gemini's 2M context handles full docs
        const results = documents.map(d => ({
          text: d.extractedText,
          documentName: d.name,
          documentType: d.type,
        }))

        return JSON.stringify({
          message: `Found ${results.length} document(s).`,
          results,
        })
      } catch (error: any) {
        return JSON.stringify({ error: `Search failed: ${error.message}` })
      }
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` })
  }
}
