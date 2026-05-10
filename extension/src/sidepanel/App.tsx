import { useState, useEffect } from 'react'
import type { User } from 'firebase/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Profile {
  id: string
  name: string
  notes?: string | null
}

interface Letter {
  id: string
  name: string
  status: 'DRAFT' | 'APPROVED' | 'REJECTED'
  profileId: string
}

interface FileField {
  selector: string
  label: string
  accept: string
}

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

type Status =
  | { type: 'idle' }
  | { type: 'loading'; message: string }
  | { type: 'success'; message: string; count?: number }
  | { type: 'error'; message: string }

interface AppProps {
  getToken: () => Promise<string | null>
  user?: User
  onSignOut?: () => void
  devMode?: boolean
}

// Icons
const GlobeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const RefreshIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
)

const ScanIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)


const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const BuildingIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <path d="M8 6h.01" />
    <path d="M16 6h.01" />
    <path d="M12 6h.01" />
    <path d="M12 10h.01" />
    <path d="M12 14h.01" />
    <path d="M16 10h.01" />
    <path d="M16 14h.01" />
    <path d="M8 10h.01" />
    <path d="M8 14h.01" />
  </svg>
)

const LogOutIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)


export default function App({ getToken, user, onSignOut, devMode = false }: AppProps) {
  // Organizations
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [orgLoading, setOrgLoading] = useState(true)
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)

  // Profiles
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string>('')
  const [status, setStatus] = useState<Status>({ type: 'idle' })
  const [pageUrl, setPageUrl] = useState<string>('')
  const [pendingValues, setPendingValues] = useState<{ selector: string; value: string; label?: string }[] | null>(null)

  // File field filling state
  const [fileFields, setFileFields] = useState<FileField[]>([])
  const [approvedLetters, setApprovedLetters] = useState<Letter[]>([])
  const [fileFieldStatus, setFileFieldStatus] = useState<Status>({ type: 'idle' })

  useEffect(() => {
    loadOrganizations()
    getCurrentUrl()
  }, [])

  useEffect(() => {
    if (currentOrg) {
      loadProfiles()
    }
  }, [currentOrg?.id])

  useEffect(() => {
    if (selectedProfileId && currentOrg) {
      loadApprovedLetters()
    }
  }, [selectedProfileId, currentOrg?.id])

  async function getCurrentUrl() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tabs[0]?.url) setPageUrl(tabs[0].url)
    } catch {
      // not in extension context
    }
  }

  async function loadOrganizations() {
    try {
      setOrgLoading(true)
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/organizations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load organizations')
      const orgs: Organization[] = await res.json()
      setOrganizations(orgs)

      // Restore or select first org
      const savedOrgId = localStorage.getItem('visa-agent-ext-org')
      const savedOrg = orgs.find((o) => o.id === savedOrgId)
      if (savedOrg) {
        setCurrentOrg(savedOrg)
      } else if (orgs.length > 0) {
        setCurrentOrg(orgs[0])
        localStorage.setItem('visa-agent-ext-org', orgs[0].id)
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    } finally {
      setOrgLoading(false)
    }
  }

  async function loadProfiles() {
    if (!currentOrg) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Organization-ID': currentOrg.id,
        },
      })
      if (!res.ok) throw new Error('Failed to load profiles')
      const data = await res.json()
      setProfiles(data)
      // Restore or select first profile
      const savedProfileId = localStorage.getItem('visa-agent-ext-profile')
      const savedProfile = data.find((p: Profile) => p.id === savedProfileId)
      if (savedProfile) {
        setSelectedProfileId(savedProfile.id)
      } else if (data.length > 0) {
        setSelectedProfileId(data[0].id)
        localStorage.setItem('visa-agent-ext-profile', data[0].id)
      } else {
        setSelectedProfileId('')
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  function selectOrg(org: Organization) {
    setCurrentOrg(org)
    localStorage.setItem('visa-agent-ext-org', org.id)
    setOrgDropdownOpen(false)
    setProfiles([])
    setSelectedProfileId('')
  }

  async function handleScanAndPreview() {
    if (!selectedProfileId || !currentOrg) {
      setStatus({ type: 'error', message: 'Please select a profile first' })
      return
    }

    setStatus({ type: 'loading', message: 'Scanning form fields...' })
    setPendingValues(null)

    try {
      const fieldsResponse = await chrome.runtime.sendMessage({ type: 'GET_FORM_FIELDS' })
      if (fieldsResponse?.error) {
        setStatus({ type: 'error', message: fieldsResponse.error })
        return
      }
      const fields = fieldsResponse?.fields ?? []
      if (fields.length === 0) {
        setStatus({ type: 'error', message: 'No form fields detected on this page' })
        return
      }

      setStatus({ type: 'loading', message: `Found ${fields.length} fields — matching...` })

      const token = await getToken()
      const res = await fetch(`${API_URL}/api/agent/fill-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Organization-ID': currentOrg.id,
        },
        body: JSON.stringify({ profileId: selectedProfileId, fields }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      const data = await res.json()
      const fieldValues = data.fieldValues ?? []

      if (fieldValues.length === 0) {
        setStatus({ type: 'error', message: 'No matching data found for these fields' })
        return
      }

      const previewValues = fieldValues.map((fv: any) => {
        const originalField = fields.find((f: any) => f.selector === fv.selector)
        return { ...fv, label: originalField?.label || fv.selector }
      })

      setPendingValues(previewValues)
      setStatus({ type: 'idle' })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  async function handleAcceptFill() {
    if (!pendingValues) return

    setStatus({ type: 'loading', message: `Filling ${pendingValues.length} fields...` })

    try {
      const fillResponse = await chrome.runtime.sendMessage({ type: 'FILL_FORM', fieldValues: pendingValues })
      const filled = fillResponse?.filled ?? pendingValues.length

      setPendingValues(null)
      setStatus({ type: 'success', message: 'Form filled successfully', count: filled })
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message })
    }
  }

  async function loadApprovedLetters() {
    if (!selectedProfileId || !currentOrg) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/letters?profileId=${selectedProfileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Organization-ID': currentOrg.id,
        },
      })
      if (!res.ok) return
      const letters: Letter[] = await res.json()
      setApprovedLetters(letters.filter(l => l.status === 'APPROVED'))
    } catch {
      // ignore
    }
  }

  async function handleScanFileFields() {
    setFileFieldStatus({ type: 'loading', message: 'Scanning for file fields...' })
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_FILE_FIELDS' })
      if (response?.error) {
        setFileFieldStatus({ type: 'error', message: response.error })
        return
      }
      const fields = response?.fields ?? []
      setFileFields(fields)
      if (fields.length === 0) {
        setFileFieldStatus({ type: 'error', message: 'No file upload fields found on this page' })
      } else {
        setFileFieldStatus({ type: 'success', message: `Found ${fields.length} file field(s)` })
      }
    } catch (err: any) {
      setFileFieldStatus({ type: 'error', message: err.message })
    }
  }

  async function handleFillFileField(fieldSelector: string, letterId: string, letterName: string) {
    if (!currentOrg) return
    setFileFieldStatus({ type: 'loading', message: 'Uploading letter to form...' })
    try {
      const token = await getToken()
      // Fetch the PDF
      const res = await fetch(`${API_URL}/api/letters/${letterId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Organization-ID': currentOrg.id,
        },
      })
      if (!res.ok) throw new Error('Failed to fetch letter PDF')

      const blob = await res.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      const fileName = `${letterName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`

      const fillResponse = await chrome.runtime.sendMessage({
        type: 'FILL_FILE_FIELD',
        selector: fieldSelector,
        fileData: base64,
        fileName,
        mimeType: 'application/pdf',
      })

      if (fillResponse?.error) {
        setFileFieldStatus({ type: 'error', message: fillResponse.error })
      } else {
        setFileFieldStatus({ type: 'success', message: `Uploaded "${letterName}" to form` })
        setFileFields([]) // Clear after successful fill
      }
    } catch (err: any) {
      setFileFieldStatus({ type: 'error', message: err.message })
    }
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0a0a0a]">
        <SpinnerIcon />
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-[#0a0a0a]">
        <BuildingIcon />
        <h2 className="text-lg font-semibold text-white mt-4 mb-2">No Organizations</h2>
        <p className="text-white/50 text-sm">
          Create an organization in the dashboard to get started
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-sm">
      {/* Header */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <GlobeIcon />
          </div>
          <span className="font-display font-bold text-white">Visa Agent</span>
          {devMode && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-medium border border-amber-500/30">
              dev
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadOrganizations()
              getCurrentUrl()
            }}
            title="Refresh"
            className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
          >
            <RefreshIcon />
          </button>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
          )}
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white/70 transition-colors"
              title="Sign out"
            >
              <LogOutIcon />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Organization selector */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-wide mb-2">Organization</p>
          <div className="relative">
            <button
              onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
              className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <BuildingIcon />
                <span className="truncate">{currentOrg?.name || 'Select organization'}</span>
              </div>
              <ChevronDownIcon />
            </button>
            {orgDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => selectOrg(org)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 text-left text-sm"
                  >
                    <span className="text-white truncate">{org.name}</span>
                    {org.id === currentOrg?.id && <CheckIcon />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current page */}
        {pageUrl && (
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-wide mb-1">Current page</p>
            <p className="text-white/60 truncate text-xs">{pageUrl}</p>
          </div>
        )}

        {/* Profile selector */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-wide mb-2">Client profile</p>
          {profiles.length === 0 ? (
            <p className="text-white/30 text-xs">
              No profiles yet.{' '}
              <a
                href={import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173'}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300"
              >
                Create one in the dashboard
              </a>
            </p>
          ) : (
            <select
              value={selectedProfileId}
              onChange={(e) => {
                setSelectedProfileId(e.target.value)
                localStorage.setItem('visa-agent-ext-profile', e.target.value)
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          {selectedProfile?.notes && <p className="text-xs text-white/30 mt-2 truncate">{selectedProfile.notes}</p>}
        </div>

        {/* Scan & Fill Section */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-wide mb-3">Form Filling</p>

          {!pendingValues && (
            <button
              onClick={handleScanAndPreview}
              disabled={status.type === 'loading' || !selectedProfileId || profiles.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {status.type === 'loading' ? (
                <>
                  <SpinnerIcon />
                  <span>Working...</span>
                </>
              ) : (
                <>
                  <ScanIcon />
                  <span>Scan Form to Fill</span>
                </>
              )}
            </button>
          )}

          {/* Preview matched fields */}
          {pendingValues && pendingValues.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/60">
                  Found <span className="text-amber-400 font-semibold">{pendingValues.length}</span> matches
                </p>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-2 rounded-lg bg-white/[0.02] border border-white/5 p-2">
                {pendingValues.map((fv, i) => (
                  <div key={i} className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <p className="text-[10px] text-white/40 truncate mb-0.5" title={fv.label}>
                      {fv.label || 'Field'}
                    </p>
                    <p className="text-xs text-white/80 break-words">{fv.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPendingValues(null)}
                  disabled={status.type === 'loading'}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-colors"
                >
                  <XIcon />
                  Cancel
                </button>
                <button
                  onClick={handleAcceptFill}
                  disabled={status.type === 'loading'}
                  className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-green-500 text-black font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50"
                >
                  <CheckIcon />
                  Accept & Fill
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Fill File Fields Section */}
        {approvedLetters.length > 0 && (
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3">
            <p className="text-[10px] font-medium text-white/40 uppercase tracking-wide mb-3">Upload Letters to Form</p>

            {fileFields.length === 0 ? (
              <button
                onClick={handleScanFileFields}
                disabled={fileFieldStatus.type === 'loading'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fileFieldStatus.type === 'loading' ? (
                  <>
                    <SpinnerIcon />
                    <span>Scanning...</span>
                  </>
                ) : (
                  <>
                    <ScanIcon />
                    <span>Scan for File Fields</span>
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-white/60">
                  Found <span className="text-teal-400 font-semibold">{fileFields.length}</span> file field(s)
                </p>
                <div className="space-y-2">
                  {fileFields.map((field, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
                      <p className="text-xs text-white/70 mb-2 truncate" title={field.label}>
                        {field.label}
                      </p>
                      <select
                        onChange={(e) => {
                          const letterId = e.target.value
                          if (letterId) {
                            const letter = approvedLetters.find(l => l.id === letterId)
                            if (letter) handleFillFileField(field.selector, letterId, letter.name)
                          }
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-teal-500/50"
                        defaultValue=""
                      >
                        <option value="" disabled>Select approved letter...</option>
                        {approvedLetters.map(letter => (
                          <option key={letter.id} value={letter.id}>{letter.name}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setFileFields([])}
                  className="w-full px-3 py-2 text-xs text-white/50 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {fileFieldStatus.type === 'success' && (
              <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckIcon />
                  {fileFieldStatus.message}
                </span>
                <button onClick={() => setFileFieldStatus({ type: 'idle' })} className="text-emerald-300 hover:text-emerald-200">
                  <XIcon />
                </button>
              </div>
            )}
            {fileFieldStatus.type === 'error' && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
                <span>{fileFieldStatus.message}</span>
                <button onClick={() => setFileFieldStatus({ type: 'idle' })} className="text-red-300 hover:text-red-200">
                  <XIcon />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {status.type === 'loading' && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
            <SpinnerIcon />
            {status.message}
          </div>
        )}
        {status.type === 'success' && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center justify-between">
            <span>
              <CheckIcon /> {status.count} field{status.count !== 1 ? 's' : ''} filled successfully
            </span>
            <button onClick={() => setStatus({ type: 'idle' })} className="text-emerald-300 hover:text-emerald-200">
              <XIcon />
            </button>
          </div>
        )}
        {status.type === 'error' && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-between">
            <span>{status.message}</span>
            <button onClick={() => setStatus({ type: 'idle' })} className="text-red-300 hover:text-red-200">
              <XIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
