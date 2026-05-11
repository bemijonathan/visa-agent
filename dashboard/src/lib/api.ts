import { getIdToken } from './firebase'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '')

let _currentOrgId: string | null = null

export function setCurrentOrganizationId(orgId: string | null) {
  _currentOrgId = orgId
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getIdToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(_currentOrgId ? { 'X-Organization-ID': _currentOrgId } : {}),
    ...(options?.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// --- Organizations ---

export interface Organization {
  id: string
  name: string
  slug: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  memberCount?: number
  profileCount?: number
  createdAt: string
}

export interface OrganizationMember {
  id: string
  userId: string
  email: string
  displayName: string | null
  photoURL?: string | null
  role: 'OWNER' | 'ADMIN' | 'MEMBER'
  createdAt: string
}

export interface OrganizationDetails extends Organization {
  currentUserRole: 'OWNER' | 'ADMIN' | 'MEMBER'
  members: OrganizationMember[]
  documentCount?: number
}

export function listOrganizations(): Promise<Organization[]> {
  return request<Organization[]>('/api/organizations')
}

export function getOrganization(id: string): Promise<OrganizationDetails> {
  return request<OrganizationDetails>(`/api/organizations/${id}`)
}

export function createOrganization(data: { name: string; slug: string }): Promise<Organization> {
  return request<Organization>('/api/organizations', { method: 'POST', body: JSON.stringify(data) })
}

export function updateOrganization(id: string, data: { name?: string }): Promise<Organization> {
  return request<Organization>(`/api/organizations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteOrganization(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/organizations/${id}`, { method: 'DELETE' })
}

export function inviteMember(orgId: string, email: string, role?: 'ADMIN' | 'MEMBER'): Promise<OrganizationMember> {
  return request<OrganizationMember>(`/api/organizations/${orgId}/invite`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  })
}

export function updateMemberRole(orgId: string, memberId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER'): Promise<OrganizationMember> {
  return request<OrganizationMember>(`/api/organizations/${orgId}/members/${memberId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  })
}

export function removeMember(orgId: string, memberId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/organizations/${orgId}/members/${memberId}`, { method: 'DELETE' })
}

export function leaveOrganization(orgId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/organizations/${orgId}/leave`, { method: 'POST' })
}

// --- Profiles ---

export interface Profile {
  id: string
  name: string
  notes?: string | null
  // Biodata fields
  dateOfBirth?: string | null
  nationality?: string | null
  passportNumber?: string | null
  passportExpiry?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  occupation?: string | null
  employer?: string | null
  // Relations
  createdAt: string
  updatedAt: string
  documents?: Document[]
  letters?: Letter[]
}

export interface ProfileBiodata {
  name?: string
  notes?: string | null
  dateOfBirth?: string | null
  nationality?: string | null
  passportNumber?: string | null
  passportExpiry?: string | null
  address?: string | null
  city?: string | null
  country?: string | null
  phone?: string | null
  email?: string | null
  occupation?: string | null
  employer?: string | null
}

export function listProfiles(): Promise<Profile[]> {
  return request<Profile[]>('/api/profiles')
}

export function getProfile(id: string): Promise<Profile> {
  return request<Profile>(`/api/profiles/${id}`)
}

export function createProfile(data: { name: string; notes?: string }): Promise<Profile> {
  return request<Profile>('/api/profiles', { method: 'POST', body: JSON.stringify(data) })
}

export function updateProfile(id: string, data: ProfileBiodata): Promise<Profile> {
  return request<Profile>(`/api/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteProfile(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/profiles/${id}`, { method: 'DELETE' })
}

// --- Documents ---

export interface Document {
  id: string
  organizationId: string
  uploadedById: string
  profileId: string | null
  type: string
  name: string
  fileId: string
  fileUrl: string
  extractedText?: string | null
  vectorIds?: string[]
  createdAt: string
  updatedAt: string
}

export async function uploadDocument(formData: FormData): Promise<{ documentId: string; fileUrl: string }> {
  const token = await getIdToken()

  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(_currentOrgId ? { 'X-Organization-ID': _currentOrgId } : {}),
  }

  const res = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

export function deleteDocument(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/documents/${id}`, { method: 'DELETE' })
}

export function extractDocument(id: string): Promise<{ message: string; extractedText?: string }> {
  return request<{ message: string; extractedText?: string }>(`/api/documents/${id}/extract`, { method: 'POST' })
}

// --- Letters ---

export type LetterStatus = 'DRAFT' | 'APPROVED' | 'REJECTED'

export interface Letter {
  id: string
  profileId: string
  name: string
  instructions?: string | null
  content: string
  status: LetterStatus
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export function listLetters(profileId: string): Promise<Letter[]> {
  return request<Letter[]>(`/api/letters?profileId=${profileId}`)
}

export function deleteLetter(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/letters/${id}`, { method: 'DELETE' })
}

export function updateLetter(id: string, data: { content?: string; status?: LetterStatus }): Promise<Letter> {
  return request<Letter>(`/api/letters/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function approveLetter(id: string): Promise<Letter> {
  return request<Letter>(`/api/letters/${id}/approve`, { method: 'POST' })
}

export function rejectLetter(id: string): Promise<Letter> {
  return request<Letter>(`/api/letters/${id}/reject`, { method: 'POST' })
}

export function getLetter(id: string): Promise<Letter> {
  return request<Letter>(`/api/letters/${id}`)
}

export function improveLetter(
  id: string,
  instruction: string,
  currentContent: string
): Promise<{ content: string; message: string }> {
  return request<{ content: string; message: string }>(`/api/letters/${id}/improve`, {
    method: 'POST',
    body: JSON.stringify({ instruction, currentContent }),
  })
}

export function generateLetter(
  profileId: string,
  name: string,
  instructions: string
): Promise<{ letterId: string; content: string }> {
  return request<{ letterId: string; content: string }>('/api/letters/generate', {
    method: 'POST',
    body: JSON.stringify({ profileId, name, instructions }),
  })
}

// --- Chat ---

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function chatWithDocuments(
  profileId: string,
  message: string,
  history: ChatMessage[]
): Promise<{ response: string }> {
  return request<{ response: string }>('/api/agent/profile-chat', {
    method: 'POST',
    body: JSON.stringify({ profileId, message, history }),
  })
}
