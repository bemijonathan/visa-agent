import { describe, test, expect, beforeAll } from 'bun:test'
import { groqComplete } from '../lib/groq'

// Integration tests - these require a valid GROQ_API_KEY
// Run with: GROQ_API_KEY=xxx bun test form.integration.test.ts

const hasGroqKey = !!process.env.GROQ_API_KEY

describe.skipIf(!hasGroqKey)('Groq Integration', () => {
  test('completes a simple prompt', async () => {
    const result = await groqComplete('What is 2+2? Reply with just the number.')
    expect(result).toContain('4')
  }, 10000)

  test('extracts form values from document text', async () => {
    const documentText = `
TORONTO, CANADA ITINERARY
MAFIANA ONYEKA NATALIE
MAY 3rd – MAY 9th, 2026

TRIP DETAILS
Passport Number: B50040545
Booking Reference: 7CJLZ6

Accommodation:
Doubletree by Hilton Toronto Airport, 925 Dixon Road, Etobicoke, M9W 1J8
Toronto, Canada
Phone: +1 416 674 2222
Confirmation Number: 5096.132.203 | PIN: 5314

Check-in: Sunday, 3 May 2026 (from 15:00)
Check-out: Saturday, 9 May 2026 (before 11:00)
`

    const fields = [
      { selector: '#first_name', label: 'First Name', type: 'text' },
      { selector: '#last_name', label: 'Last Name', type: 'text' },
      { selector: '#passport_number', label: 'Passport Number', type: 'text' },
      { selector: '#arrival_date', label: 'Arrival Date', type: 'date' },
      { selector: '#accommodation', label: 'Accommodation', type: 'text' },
    ]

    const prompt = `Extract information from this document to fill the form fields.

DOCUMENT:
${documentText}

FORM FIELDS:
${JSON.stringify(fields, null, 2)}

Return ONLY a JSON array of objects with found values:
[{"selector": "#field_selector", "value": "extracted_value"}, ...]

Only include fields where you found real data.`

    const result = await groqComplete(prompt)
    console.log('Groq response:', result)

    const jsonMatch = result.match(/\[[\s\S]*\]/)
    expect(jsonMatch).not.toBeNull()

    const fieldValues = JSON.parse(jsonMatch![0])
    expect(Array.isArray(fieldValues)).toBe(true)
    expect(fieldValues.length).toBeGreaterThan(0)

    // Check that passport was extracted
    const passportField = fieldValues.find((f: any) => f.selector === '#passport_number')
    expect(passportField).toBeDefined()
    expect(passportField.value).toBe('B50040545')
  }, 30000)

  test('handles select field options', async () => {
    const prompt = `Given this occupation: "Software Engineer at Tech Corp"

Fill this form field:
{
  "selector": "#occupation",
  "label": "Current Occupation",
  "type": "select",
  "options": ["Employed (private sector)", "Employed (public sector)", "Self-employed", "Student", "Retired", "Unemployed"]
}

Return a JSON array with the best matching option:
[{"selector": "#occupation", "value": "selected_option"}]`

    const result = await groqComplete(prompt)
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    expect(jsonMatch).not.toBeNull()

    const fieldValues = JSON.parse(jsonMatch![0])
    expect(fieldValues[0].value).toBe('Employed (private sector)')
  }, 15000)
})

describe.skipIf(!hasGroqKey)('Form Filling E2E', () => {
  test('fills visa form from travel documents', async () => {
    const documentContext = `
[DOCUMENT: Itinerary.pdf - TYPE: itinerary]
KAYS/A2W TRAVELS LTD
NO 7 OLORUNFUNMILOLA OKIKIOLU STREET
OFF TOYIN STREET IKEJA
LAGOS, NIGERIA
TELEPHONE: +2348072690349
BOOKING REF: 7CJLZ6
DATE: 10 MARCH 2026

MAFIANA/ONYEKA NATALIE

FLIGHT AF 149 - AIR FRANCE SUN 03 MAY 2026
LAGOS (LOS) -> PARIS (CDG) -> TORONTO (YYZ)
DEPARTURE: 11:30 LOCAL TIME
ARRIVAL: 17:45 LOCAL TIME

---

[DOCUMENT: Hotel Booking.pdf - TYPE: accommodation]
DOUBLETREE BY HILTON TORONTO AIRPORT
925 Dixon Road, Etobicoke, M9W 1J8
Toronto, Canada
Phone: +1 416 674 2222

Guest: MAFIANA ONYEKA NATALIE
Confirmation: 5096132203
Check-in: May 3, 2026
Check-out: May 9, 2026
`

    const fields = [
      { selector: '#first_name', label: 'First Name', type: 'text' },
      { selector: '#last_name', label: 'Last Name', type: 'text' },
      { selector: '#destination_country', label: 'Destination Country', type: 'text' },
      { selector: '#arrival_date', label: 'Arrival Date', type: 'date' },
      { selector: '#departure_date', label: 'Departure Date', type: 'date' },
      { selector: '#accommodation', label: 'Accommodation Address', type: 'text' },
    ]

    const prompt = `You are filling out a visa application form.
Extract information from the documents below.

DOCUMENT EXTRACTS:
${documentContext}

FORM FIELDS TO FILL:
${JSON.stringify(fields, null, 2)}

Instructions:
1. Search the documents thoroughly for any information matching each field
2. For date fields, convert to YYYY-MM-DD format
3. ONLY include fields where you found an actual value
4. Do not guess or make up information

Return ONLY a JSON array of objects with found values:
[{"selector": "#field_selector", "value": "extracted_value"}, ...]`

    const result = await groqComplete(prompt)
    console.log('E2E test response:', result)

    const jsonMatch = result.match(/\[[\s\S]*\]/)
    expect(jsonMatch).not.toBeNull()

    const fieldValues = JSON.parse(jsonMatch![0])

    // Filter out "Not available" values like the actual code does
    const filtered = fieldValues.filter((fv: any) =>
      fv.value &&
      fv.value !== 'Not available' &&
      fv.value !== 'N/A' &&
      fv.value.toLowerCase() !== 'not available' &&
      fv.value.trim() !== ''
    )

    expect(filtered.length).toBeGreaterThanOrEqual(4)

    // Verify key extractions
    const lastName = filtered.find((f: any) => f.selector === '#last_name')
    expect(lastName?.value).toMatch(/MAFIANA/i)

    const destination = filtered.find((f: any) => f.selector === '#destination_country')
    expect(destination?.value).toMatch(/Canada/i)

    const arrivalDate = filtered.find((f: any) => f.selector === '#arrival_date')
    expect(arrivalDate?.value).toMatch(/2026-05-03/)
  }, 30000)
})
