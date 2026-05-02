import { describe, test, expect, mock, beforeAll } from 'bun:test'

// Test the field value filtering logic
describe('Form Field Value Filtering', () => {
  const filterFieldValues = (fieldValues: Array<{ selector: string; value: string }>) => {
    return fieldValues.filter((fv) =>
      fv.value &&
      fv.value !== 'Not available' &&
      fv.value !== 'N/A' &&
      fv.value.toLowerCase() !== 'not available' &&
      fv.value.trim() !== ''
    )
  }

  test('filters out "Not available" values', () => {
    const input = [
      { selector: '#name', value: 'John Doe' },
      { selector: '#email', value: 'Not available' },
      { selector: '#phone', value: 'not available' },
      { selector: '#passport', value: 'AB123456' },
    ]
    const result = filterFieldValues(input)
    expect(result).toHaveLength(2)
    expect(result[0].selector).toBe('#name')
    expect(result[1].selector).toBe('#passport')
  })

  test('filters out N/A values', () => {
    const input = [
      { selector: '#name', value: 'John Doe' },
      { selector: '#email', value: 'N/A' },
    ]
    const result = filterFieldValues(input)
    expect(result).toHaveLength(1)
    expect(result[0].value).toBe('John Doe')
  })

  test('filters out empty strings', () => {
    const input = [
      { selector: '#name', value: 'John Doe' },
      { selector: '#email', value: '' },
      { selector: '#phone', value: '   ' },
    ]
    const result = filterFieldValues(input)
    expect(result).toHaveLength(1)
  })

  test('keeps valid values', () => {
    const input = [
      { selector: '#name', value: 'MAFIANA ONYEKA NATALIE' },
      { selector: '#passport', value: 'B50040545' },
      { selector: '#arrival_date', value: '2026-05-03' },
      { selector: '#accommodation', value: 'Doubletree by Hilton Toronto Airport' },
    ]
    const result = filterFieldValues(input)
    expect(result).toHaveLength(4)
  })
})

// Test JSON extraction from LLM response
describe('JSON Extraction from LLM Response', () => {
  const extractJson = (text: string): Array<{ selector: string; value: string }> | null => {
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  }

  test('extracts JSON array from clean response', () => {
    const response = '[{"selector": "#name", "value": "John"}]'
    const result = extractJson(response)
    expect(result).toHaveLength(1)
    expect(result![0].value).toBe('John')
  })

  test('extracts JSON array with surrounding text', () => {
    const response = `Based on the documents, here are the values:

[{"selector": "#name", "value": "John"}, {"selector": "#email", "value": "john@example.com"}]

Note: Some fields could not be found.`
    const result = extractJson(response)
    expect(result).toHaveLength(2)
  })

  test('extracts JSON from markdown code block', () => {
    const response = `\`\`\`json
[{"selector": "#name", "value": "John"}]
\`\`\``
    const result = extractJson(response)
    expect(result).toHaveLength(1)
  })

  test('returns null for invalid response', () => {
    const response = 'Sorry, I could not find any matching data.'
    const result = extractJson(response)
    expect(result).toBeNull()
  })
})

// Test date formatting
describe('Date Formatting', () => {
  test('accepts YYYY-MM-DD format', () => {
    const date = '2026-05-03'
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('validates date parts', () => {
    const date = '2026-05-03'
    const [year, month, day] = date.split('-').map(Number)
    expect(year).toBe(2026)
    expect(month).toBe(5)
    expect(day).toBe(3)
  })
})

// Test profile info builder
describe('Profile Info Builder', () => {
  const buildProfileInfo = (profile: Record<string, string | null>) => {
    return [
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
  }

  test('builds profile info with all fields', () => {
    const profile = {
      name: 'John Doe',
      dateOfBirth: '1990-01-15',
      nationality: 'Nigerian',
      passportNumber: 'A12345678',
      passportExpiry: '2030-01-15',
      address: '123 Main St',
      city: 'Lagos',
      country: 'Nigeria',
      phone: '+234123456789',
      email: 'john@example.com',
      occupation: 'Engineer',
      employer: 'Tech Corp',
      notes: 'VIP client',
    }
    const result = buildProfileInfo(profile)
    expect(result).toContain('Name: John Doe')
    expect(result).toContain('Passport Number: A12345678')
    expect(result).toContain('Email: john@example.com')
  })

  test('excludes null fields', () => {
    const profile = {
      name: 'John Doe',
      dateOfBirth: null,
      nationality: 'Nigerian',
      passportNumber: null,
      passportExpiry: null,
      address: null,
      city: null,
      country: null,
      phone: null,
      email: null,
      occupation: null,
      employer: null,
      notes: null,
    }
    const result = buildProfileInfo(profile)
    expect(result).toBe('Name: John Doe\nNationality: Nigerian')
  })
})
