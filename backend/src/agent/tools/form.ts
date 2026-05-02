import { prisma } from '../../lib/prisma.js'
import { geminiModel } from '../../lib/gemini.js'
import { groqComplete } from '../../lib/groq.js'

// Tool definitions for Claude
export const formTools = [
  {
    name: 'detect_form_fields',
    description: 'Analyze HTML to detect form fields. Returns a list of fields with their names, labels, types, and whether they are required.',
    input_schema: {
      type: 'object' as const,
      properties: {
        html: {
          type: 'string',
          description: 'The HTML content containing the form to analyze',
        },
      },
      required: ['html'],
    },
  },
  {
    name: 'fill_form_fields',
    description: 'Generate values for detected form fields using profile data and document information. Uses RAG to find relevant data.',
    input_schema: {
      type: 'object' as const,
      properties: {
        fields: {
          type: 'array',
          description: 'Array of form fields to fill',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              label: { type: 'string' },
              type: { type: 'string' },
              required: { type: 'boolean' },
              options: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
        profile_id: {
          type: 'string',
          description: 'The profile ID to use for filling the form',
        },
      },
      required: ['fields', 'profile_id'],
    },
  },
]

// Tool implementations
export async function executeFormTool(
  toolName: string,
  input: Record<string, any>,
  organizationId: string
): Promise<string> {
  switch (toolName) {
    case 'detect_form_fields': {
      try {
        const result = await geminiModel.generateContent([
          {
            text: `Analyze this HTML and extract all form fields. For each field, identify:
- name: the field's name attribute, id, or a descriptive identifier
- label: the associated label text or placeholder
- type: input type (text, email, date, select, checkbox, radio, textarea, etc.)
- required: whether the field appears to be required
- options: for select/radio fields, list the available options

Return ONLY a JSON array of field objects, no other text.

HTML:
${input.html}`,
          },
        ])

        const text = result.response.text()

        // Extract JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const fields = JSON.parse(jsonMatch[0])
          return JSON.stringify({
            message: `Detected ${fields.length} form field(s).`,
            fields,
          })
        }

        return JSON.stringify({
          message: 'Could not parse form fields',
          fields: [],
        })
      } catch (error: any) {
        return JSON.stringify({ error: `Failed to detect form fields: ${error.message}` })
      }
    }

    case 'fill_form_fields': {
      console.log('[fill_form] Starting fill_form_fields')
      try {
        const profile = await prisma.profile.findFirst({
          where: { id: input.profile_id, organizationId },
        })

        if (!profile) {
          return JSON.stringify({ error: 'Profile not found' })
        }

        // Fetch the full extracted text for the profile's documents.
        // Gemini 2.5 Pro has a massive 2M token context window, easily handling full documents.
        const documents = await prisma.document.findMany({
          where: { profileId: input.profile_id, organizationId, extractedText: { not: null } },
          select: { name: true, type: true, extractedText: true }
        })

        let documentContext = 'No documents found for this profile.'

        if (documents.length > 0) {
          documentContext = documents.map(d =>
            `[DOCUMENT: ${d.name} - TYPE: ${d.type}]\n${d.extractedText}`
          ).join('\n\n---\n\n')
        }

        // Build profile info including biodata fields
        const profileInfo = [
          `Name: ${profile.name}`,
          profile.dateOfBirth ? `Date of Birth: ${profile.dateOfBirth}` : null,
          profile.nationality ? `Nationality: ${profile.nationality}` : null,
          profile.passportNumber ? `Passport Number: ${profile.passportNumber}` : null,
          profile.passportExpiry ? `Passport Expiry: ${profile.passportExpiry}` : null,
          profile.address ? `Address: ${profile.address}` : null,
          profile.city ? `City: ${profile.city}` : null,
          profile.country ? `Country: ${profile.country}` : null,
          profile.phone ? `Phone: ${profile.phone}` : null,
          profile.email ? `Email: ${profile.email}` : null,
          profile.occupation ? `Occupation: ${profile.occupation}` : null,
          profile.employer ? `Employer: ${profile.employer}` : null,
          profile.notes ? `Notes: ${profile.notes}` : null,
        ].filter(Boolean).join('\n')

        const prompt = `You are filling out a visa application form for client "${profile.name}".
Extract information from the profile and documents below. Look carefully through ALL document text for relevant data.

PROFILE INFO:
${profileInfo}

DOCUMENT EXTRACTS (search these carefully for names, dates, passport info, addresses, phone numbers, emails, etc.):
${documentContext}

FORM FIELDS TO FILL:
${JSON.stringify(input.fields, null, 2)}

Instructions:
1. Search the documents thoroughly for any information matching each field
2. For date fields, convert to YYYY-MM-DD format
3. For select/radio fields, pick the closest matching option from the available options
4. For name fields, look for passenger names, guest names, or any person names in bookings
5. For contact info, look for phone numbers, emails, addresses in any booking confirmations
6. ONLY include fields where you found an actual value - do NOT include fields with "Not available" or empty values
7. Do not guess or make up information

Return ONLY a JSON array of objects with found values:
[{"selector": "#field_selector", "value": "extracted_value"}, ...]

Only include fields where you found real data. Omit any field you cannot find information for.`

        const text = await groqComplete(prompt)
        console.log('[fill_form] Groq response:', text)
        console.log('[fill_form] Fields sent:', JSON.stringify(input.fields))
        console.log('[fill_form] Document count:', documents.length)

        const jsonMatch = text.match(/\[[\s\S]*\]/)

        if (jsonMatch) {
          const allFieldValues = JSON.parse(jsonMatch[0])
          // Filter out "Not available" and empty values
          const fieldValues = allFieldValues.filter((fv: any) =>
            fv.value &&
            fv.value !== 'Not available' &&
            fv.value !== 'N/A' &&
            fv.value.toLowerCase() !== 'not available' &&
            fv.value.trim() !== ''
          )
          console.log('[fill_form] Parsed fieldValues:', allFieldValues.length, '-> filtered:', fieldValues.length)
          return JSON.stringify({
            message: `Generated values for ${fieldValues.length} field(s).`,
            fieldValues,
          })
        }

        console.log('[fill_form] No JSON array found in response')
        return JSON.stringify({ message: 'Could not generate field values', fieldValues: [] })
      } catch (error: any) {
        return JSON.stringify({ error: `Failed to fill form fields: ${error.message}` })
      }
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${toolName}` })
  }
}
