import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Globe, Loader2, AlertCircle, Upload, Trash2,
  Eye, FileText, Mail, ChevronDown, ChevronUp, X, Plus, Check, Download,
  MessageCircle, Send, User, Bot, Edit2, Save
} from 'lucide-react'
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import {
  getProfile, updateProfile, uploadDocument, deleteDocument,
  extractDocument, listLetters, deleteLetter, generateLetter,
  updateLetter, approveLetter, rejectLetter, chatWithDocuments, ChatMessage,
  Profile, Document, Letter, ProfileBiodata, LetterStatus,
} from '../lib/api'

type Tab = 'documents' | 'letters' | 'chat'

const BIODATA_FIELDS: { key: keyof ProfileBiodata; label: string; type?: string; placeholder?: string }[] = [
  { key: 'name', label: 'Full Name', placeholder: 'John Doe' },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'nationality', label: 'Nationality', placeholder: 'Nigerian' },
  { key: 'passportNumber', label: 'Passport Number', placeholder: 'A12345678' },
  { key: 'passportExpiry', label: 'Passport Expiry', type: 'date' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
  { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+234 800 000 0000' },
  { key: 'address', label: 'Address', placeholder: '123 Main Street' },
  { key: 'city', label: 'City', placeholder: 'Lagos' },
  { key: 'country', label: 'Country', placeholder: 'Nigeria' },
  { key: 'occupation', label: 'Occupation', placeholder: 'Software Engineer' },
  { key: 'employer', label: 'Employer', placeholder: 'Company Name' },
]

const DOC_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'birth_certificate', label: 'Birth Certificate' },
  { value: 'marriage_certificate', label: 'Marriage Certificate' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'tax_return', label: 'Tax Return' },
  { value: 'payslip', label: 'Payslip' },
  { value: 'employment_letter', label: 'Employment Letter' },
  { value: 'business_registration', label: 'Business Registration' },
  { value: 'itinerary', label: 'Travel Itinerary' },
  { value: 'hotel_booking', label: 'Hotel Booking' },
  { value: 'flight_booking', label: 'Flight Booking' },
  { value: 'invitation_letter', label: 'Invitation Letter' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'insurance', label: 'Travel Insurance' },
  { value: 'photo', label: 'Passport Photo' },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'lease_agreement', label: 'Lease / Tenancy Agreement' },
  { value: 'sponsor_letter', label: 'Sponsor Letter' },
  { value: 'reference_letter', label: 'Reference Letter' },
  { value: 'visa_refusal', label: 'Previous Visa Refusal' },
  { value: 'old_visa', label: 'Previous Visa / Stamp' },
  { value: 'other', label: 'Other' },
]

const ACCEPTED_EXTENSIONS = '.pdf,.jpg,.jpeg,.png,.webp,.gif,.tiff,.tif,.bmp,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.odt,.ods'

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('documents')
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [showBiodataModal, setShowBiodataModal] = useState(false)

  useEffect(() => { if (id) loadData(id) }, [id])

  async function loadData(profileId: string) {
    try {
      setLoading(true)
      setError(null)
      const [p, l] = await Promise.all([getProfile(profileId), listLetters(profileId)])
      setProfile(p)
      setLetters(l)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load client')
    } finally {
      setLoading(false)
    }
  }

  async function saveName() {
    if (!profile || !nameValue.trim()) return
    setSavingName(true)
    try {
      const updated = await updateProfile(profile.id, { name: nameValue.trim() })
      setProfile((prev) => prev ? { ...prev, name: updated.name } : prev)
      setEditingName(false)
    } catch { /* ignore */ } finally {
      setSavingName(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
    </div>
  )

  if (error || !profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="p-8 max-w-sm w-full text-center rounded-2xl bg-white/[0.02] border border-white/5">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="font-medium text-white mb-6">{error ?? 'Client not found'}</p>
        <button
          onClick={() => navigate('/app')}
          className="w-full px-5 py-3 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
        >
          Back to Clients
        </button>
      </div>
    </div>
  )

  const docCount = profile.documents?.length ?? 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/app')}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
              <span className="text-amber-400 font-bold">
                {profile.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-base font-semibold w-48 focus:outline-none focus:border-amber-500/50"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                  autoFocus
                />
                <button
                  onClick={saveName}
                  disabled={savingName}
                  className="px-3 py-2 text-xs font-medium bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors"
                >
                  {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="px-3 py-2 text-xs font-medium bg-white/5 text-white/70 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setNameValue(profile.name); setEditingName(true) }}
                className="font-display text-xl font-bold text-white hover:text-amber-400 transition-colors truncate text-left"
              >
                {profile.name}
              </button>
            )}
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Globe className="w-5 h-5 text-black" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex gap-0">
            {(['documents', 'letters', 'chat'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
              >
                {tab}
                {tab === 'documents' && docCount > 0 && (
                  <span className="ml-2 text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                    {docCount}
                  </span>
                )}
                {tab === 'letters' && letters.length > 0 && (
                  <span className="ml-2 text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                    {letters.length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowBiodataModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/60 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Client
          </button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-8">
        {activeTab === 'documents' && (
          <DocumentsTab
            profile={profile}
            onRefresh={() => loadData(profile.id)}
          />
        )}
        {activeTab === 'letters' && (
          <LettersTab
            profile={profile}
            letters={letters}
            onRefresh={async () => { const l = await listLetters(profile.id); setLetters(l) }}
          />
        )}
        {activeTab === 'chat' && (
          <ChatTab profile={profile} />
        )}
      </main>

      {/* Biodata Modal */}
      {showBiodataModal && (
        <BiodataModal
          profile={profile}
          onUpdate={(updated) => setProfile(updated)}
          onClose={() => setShowBiodataModal(false)}
        />
      )}
    </div>
  )
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

type QueueItem = { file: File; type: string; name: string; status: 'pending' | 'uploading' | 'extracting' | 'done' | 'error'; error?: string }

function DocumentsTab({ profile, onRefresh }: { profile: Profile; onRefresh: () => Promise<void> }) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [extractingId, setExtractingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const items: QueueItem[] = Array.from(files).map((f) => ({
      file: f,
      type: guessDocType(f.name),
      name: f.name,
      status: 'pending',
    }))
    setQueue((q) => [...q, ...items])
  }

  function guessDocType(filename: string): string {
    const lower = filename.toLowerCase()
    if (lower.includes('passport')) return 'passport'
    if (lower.includes('bank') || lower.includes('statement')) return 'bank_statement'
    if (lower.includes('payslip') || lower.includes('pay_slip') || lower.includes('salary')) return 'payslip'
    if (lower.includes('tax')) return 'tax_return'
    if (lower.includes('flight') || lower.includes('airline')) return 'flight_booking'
    if (lower.includes('hotel')) return 'hotel_booking'
    if (lower.includes('itinerary')) return 'itinerary'
    if (lower.includes('insurance')) return 'insurance'
    if (lower.includes('invitation')) return 'invitation_letter'
    if (lower.includes('employ')) return 'employment_letter'
    if (lower.includes('birth')) return 'birth_certificate'
    if (lower.includes('marriage')) return 'marriage_certificate'
    if (lower.includes('lease') || lower.includes('tenancy')) return 'lease_agreement'
    return 'other'
  }

  function updateItem(index: number, patch: Partial<QueueItem>) {
    setQueue((q) => q.map((item, i) => i === index ? { ...item, ...patch } : item))
  }

  async function uploadAll() {
    const pending = queue.map((item, i) => ({ item, i })).filter(({ item }) => item.status === 'pending')
    await Promise.all(pending.map(async ({ item, i }) => {
      updateItem(i, { status: 'uploading' })
      try {
        const fd = new FormData()
        fd.append('file', item.file)
        fd.append('type', item.type)
        fd.append('profileId', profile.id)
        fd.append('name', item.name || item.file.name)
        const { documentId } = await uploadDocument(fd)

        // Auto-extract after upload
        updateItem(i, { status: 'extracting' })
        try {
          await extractDocument(documentId)
        } catch {
          // Extraction failed but upload succeeded - still mark as done
          console.warn('Auto-extraction failed for document:', documentId)
        }
        updateItem(i, { status: 'done' })
      } catch (err: unknown) {
        updateItem(i, { status: 'error', error: err instanceof Error ? err.message : 'Upload failed' })
      }
    }))
    await onRefresh()
  }

  function removeFromQueue(index: number) {
    setQueue((q) => q.filter((_, i) => i !== index))
  }

  function clearDone() {
    setQueue((q) => q.filter((item) => item.status !== 'done'))
  }

  async function handleExtract(docId: string) {
    setExtractingId(docId)
    try {
      await extractDocument(docId)
      await onRefresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Extraction failed')
    } finally {
      setExtractingId(null)
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm('Delete this document?')) return
    setDeletingId(docId)
    try {
      await deleteDocument(docId)
      await onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  const docs: Document[] = profile.documents ?? []
  const hasPending = queue.some((item) => item.status === 'pending')
  const isProcessing = queue.some((item) => item.status === 'uploading' || item.status === 'extracting')
  const hasDone = queue.some((item) => item.status === 'done')

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/70">Upload Documents</h2>
          <span className="text-xs text-white/30">PDF, Word, Excel, images, and more</span>
        </div>

        <div
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            dragging ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-amber-500/30 hover:bg-white/[0.02]'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
        >
          <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/50 font-medium">Drop files here or <span className="text-amber-400">browse</span></p>
          <p className="text-xs text-white/30 mt-1">Passport, bank statements, bookings, letters, photos — any format</p>
          <input
            ref={fileRef}
            type="file"
            multiple
            className="hidden"
            accept={ACCEPTED_EXTENSIONS}
            onChange={(e) => { if (e.target.files) { addFiles(e.target.files); e.target.value = '' } }}
          />
        </div>

        {/* Queue */}
        {queue.length > 0 && (
          <div className="mt-4 space-y-2">
            {queue.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <FileText className="w-4 h-4 text-white/30 shrink-0" />
                <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                  <input
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs truncate focus:outline-none focus:border-amber-500/50"
                    value={item.name}
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                    disabled={item.status !== 'pending'}
                    placeholder="Document name"
                  />
                  <select
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500/50"
                    value={item.type}
                    onChange={(e) => updateItem(i, { type: e.target.value })}
                    disabled={item.status !== 'pending'}
                  >
                    {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="shrink-0 w-28 text-right">
                  {item.status === 'pending' && (
                    <button onClick={() => removeFromQueue(i)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white/60">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {item.status === 'uploading' && <span className="text-xs text-amber-400 font-medium flex items-center gap-1 justify-end"><Loader2 className="w-3 h-3 animate-spin" /> Uploading</span>}
                  {item.status === 'extracting' && <span className="text-xs text-purple-400 font-medium flex items-center gap-1 justify-end"><Loader2 className="w-3 h-3 animate-spin" /> Extracting</span>}
                  {item.status === 'done' && <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 justify-end"><Check className="w-3 h-3" /> Done</span>}
                  {item.status === 'error' && <span className="text-xs text-red-400 truncate" title={item.error}>Failed</span>}
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-2">
              {hasDone && !isProcessing && (
                <button onClick={clearDone} className="px-4 py-2 text-xs font-medium bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors">
                  Clear done
                </button>
              )}
              {hasPending && (
                <button
                  onClick={uploadAll}
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-lg ml-auto hover:shadow-lg hover:shadow-amber-500/20 transition-all"
                >
                  {isProcessing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</> : <><Upload className="w-3.5 h-3.5" /> Upload {queue.filter(q => q.status === 'pending').length} file{queue.filter(q => q.status === 'pending').length !== 1 ? 's' : ''}</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div>
        <h2 className="text-sm font-semibold text-white/70 mb-3">
          Documents <span className="text-white/30 font-normal">({docs.length})</span>
        </h2>
        {docs.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
            <FileText className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 text-sm">No documents yet — drag and drop files above to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.map((doc) => (
              <DocRow
                key={doc.id}
                doc={doc}
                expanded={expandedId === doc.id}
                onToggleExpand={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                onExtract={() => handleExtract(doc.id)}
                onDelete={() => handleDelete(doc.id)}
                extracting={extractingId === doc.id}
                deleting={deletingId === doc.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DocRow({
  doc, expanded, onToggleExpand, onExtract, onDelete, extracting, deleting,
}: {
  doc: Document; expanded: boolean
  onToggleExpand: () => void; onExtract: () => void; onDelete: () => void
  extracting: boolean; deleting: boolean
}) {
  const typeLabel = DOC_TYPES.find((t) => t.value === doc.type)?.label ?? doc.type
  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400/10 to-orange-500/5 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/10">
          <FileText className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{doc.name}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{typeLabel}</span>
            {doc.extractedText
              ? <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> Processed</span>
              : <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Not processed</span>
            }
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
            className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white/70 transition-colors" title="View original">
            <Eye className="w-4 h-4" />
          </a>
          {!doc.extractedText && (
            <button onClick={onExtract} disabled={extracting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors" title="Extract text from document">
              {extracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
              {extracting ? 'Extracting...' : 'Extract'}
            </button>
          )}
          {doc.extractedText && (
            <button onClick={onToggleExpand}
              className="p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white/70 transition-colors" title="Preview text">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          <button onClick={onDelete} disabled={deleting}
            className="p-2 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-colors">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
      {expanded && doc.extractedText && (
        <div className="border-t border-white/5 px-4 py-4 bg-white/[0.01]">
          <p className="text-xs font-medium text-white/40 mb-2">Extracted Text</p>
          <pre className="text-xs text-white/70 whitespace-pre-wrap font-mono leading-relaxed max-h-60 overflow-y-auto">
            {doc.extractedText}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Letters Tab ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LetterStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-white/10', text: 'text-white/60', label: 'Draft' },
  APPROVED: { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: 'Approved' },
  REJECTED: { bg: 'bg-red-500/10 border border-red-500/20', text: 'text-red-400', label: 'Rejected' },
}

function LettersTab({ profile, letters, onRefresh }: {
  profile: Profile; letters: Letter[]; onRefresh: () => Promise<void>
}) {
  const [showGenerate, setShowGenerate] = useState(false)
  const [viewingLetter, setViewingLetter] = useState<Letter | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Delete this letter?')) return
    setDeletingId(id)
    try {
      await deleteLetter(id)
      await onRefresh()
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/70">
          Letters <span className="text-white/30 font-normal">({letters.length})</span>
        </h2>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Generate Letter
        </button>
      </div>

      {letters.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <Mail className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm mb-6">No letters yet — generate a cover letter or employer support letter</p>
          <button
            onClick={() => setShowGenerate(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/30"
          >
            Generate Letter
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {letters.map((letter) => {
            const status = letter.status || 'DRAFT'
            const statusStyle = STATUS_STYLES[status]
            return (
              <div key={letter.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-violet-500/10 rounded-xl flex items-center justify-center shrink-0 border border-purple-500/20">
                  <Mail className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white text-sm truncate">{letter.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(letter.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setViewingLetter(letter)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> View
                  </button>
                  <Link
                    to={`/letters/${letter.id}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </Link>
                  <button onClick={() => handleDelete(letter.id)} disabled={deletingId === letter.id}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-white/30 hover:text-red-400 transition-colors">
                    {deletingId === letter.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showGenerate && (
        <GenerateLetterModal
          profile={profile}
          onClose={() => setShowGenerate(false)}
          onGenerated={async () => { setShowGenerate(false); await onRefresh() }}
        />
      )}
      {viewingLetter && (
        <LetterModal
          letter={viewingLetter}
          onClose={() => setViewingLetter(null)}
          onUpdate={async (updated) => { setViewingLetter(updated); await onRefresh() }}
        />
      )}
    </div>
  )
}

function GenerateLetterModal({ profile, onClose, onGenerated }: {
  profile: Profile; onClose: () => void; onGenerated: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [instructions, setInstructions] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Letter name is required')
      return
    }
    if (!instructions.trim()) {
      setError('Instructions are required')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      await generateLetter(profile.id, name.trim(), instructions.trim())
      await onGenerated()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="p-6 w-full max-w-lg rounded-2xl bg-[#141414] border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-white">Generate Letter</h3>
          <button onClick={onClose} disabled={generating} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/40" />
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Letter Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Canada Visa Cover Letter"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Instructions *</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Describe what kind of letter you want to generate. For example:

• 'Write a cover letter for a Canada tourist visa application. Include travel dates, accommodation details, and ties to home country.'

• 'Generate an employer support letter confirming employment and approving leave for the trip.'

• 'Create an invitation letter from the host in Canada.'"
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
              required
            />
            <p className="text-xs text-white/30 mt-2">
              The AI will use these instructions along with the client's uploaded documents to generate the letter.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-5 py-3 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-xl transition-colors" disabled={generating}>Cancel</button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
              disabled={generating || !name.trim() || !instructions.trim()}
            >
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LetterModal({ letter, onClose, onUpdate }: { letter: Letter; onClose: () => void; onUpdate: (letter: Letter) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [content, setContent] = useState(letter.content)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const status = letter.status || 'DRAFT'
  const statusStyle = STATUS_STYLES[status]

  useEffect(() => {
    setContent(letter.content)
  }, [letter.content])

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(0, 0)
    }
  }, [isEditing])

  const handleSave = async () => {
    if (content === letter.content) {
      setIsEditing(false)
      return
    }
    setSaving(true)
    try {
      const updated = await updateLetter(letter.id, { content })
      await onUpdate(updated)
      setIsEditing(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    setApproving(true)
    try {
      const updated = await approveLetter(letter.id)
      await onUpdate(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    setRejecting(true)
    try {
      const updated = await rejectLetter(letter.id)
      await onUpdate(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject')
    } finally {
      setRejecting(false)
    }
  }

  const handleDownloadDocx = async () => {
    const paragraphs = content.split('\n').map(line => {
      return new Paragraph({
        children: [new TextRun({ text: line, font: "Times New Roman", size: 24 })],
      })
    })

    const doc = new DocxDocument({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    })

    try {
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${letter.name.replace(/[^a-zA-Z0-9]/g, '-')}.docx`)
    } catch (err) {
      console.error('Failed to generate DOCX', err)
      alert('Failed to generate DOCX file')
    }
  }

  // Format content for display (convert line breaks to paragraphs)
  const formattedContent = content.split('\n\n').map((paragraph, i) => (
    <p key={i} className="mb-4 last:mb-0">
      {paragraph.split('\n').map((line, j) => (
        <span key={j}>
          {line}
          {j < paragraph.split('\n').length - 1 && <br />}
        </span>
      ))}
    </p>
  ))

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden rounded-2xl bg-[#141414] border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-white">{letter.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
            </div>
            <p className="text-xs text-white/30 mt-1">
              {new Date(letter.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Approve/Reject buttons - only show for DRAFT status */}
            {status === 'DRAFT' && !isEditing && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={approving || rejecting}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                >
                  {approving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={approving || rejecting}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                >
                  {rejecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Reject
                </button>
              </>
            )}
            {/* Reset to Draft button - show for APPROVED or REJECTED */}
            {status !== 'DRAFT' && !isEditing && (
              <button
                onClick={async () => {
                  try {
                    const updated = await updateLetter(letter.id, { status: 'DRAFT' })
                    await onUpdate(updated)
                  } catch (err) {
                    alert(err instanceof Error ? err.message : 'Failed to reset status')
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-colors"
              >
                Reset to Draft
              </button>
            )}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/60 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-400 to-green-500 text-black rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white/40" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isEditing ? (
            <div className="p-6">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[400px] p-4 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 text-sm leading-relaxed font-sans resize-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                placeholder="Letter content..."
              />
              <p className="text-xs text-white/30 mt-3">
                Use blank lines to separate paragraphs. Changes are saved when you click Save.
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Letter paper styling */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 min-h-[400px]">
                <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed">
                  {formattedContent}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="flex-1 px-5 py-3 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            Copy to Clipboard
          </button>
          <button
            onClick={handleDownloadDocx}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            <Download className="w-4 h-4" />
            Download DOCX
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

function ChatTab({ profile }: { profile: Profile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function handleSend() {
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput('')
    setError(null)
    setSending(true)

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)

    try {
      const { response } = await chatWithDocuments(profile.id, userMessage, messages)
      setMessages([...newMessages, { role: 'assistant', content: response }])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const hasDocuments = (profile.documents?.length ?? 0) > 0
  const processedDocs = profile.documents?.filter(d => d.extractedText).length ?? 0

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
      {/* Header info */}
      <div className="mb-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-xl flex items-center justify-center shrink-0 border border-cyan-500/20">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Chat with Documents</h2>
            <p className="text-xs text-white/40">
              {hasDocuments
                ? `${processedDocs} of ${profile.documents?.length} documents processed`
                : 'Upload and process documents to start chatting'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white/[0.02] border border-white/5 p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-cyan-500/20">
              <Bot className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-2">Ask about {profile.name}'s documents</h3>
            <p className="text-white/40 text-sm max-w-md mb-6">
              Ask questions about passport details, travel history, employment, finances, or any information from the uploaded documents.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {[
                'What is the passport number?',
                'Summarize employment history',
                'What are the travel dates?',
                'List all bank account balances',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-xs font-medium bg-white/5 text-white/60 rounded-full hover:bg-white/10 hover:text-white/80 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <Bot className="w-4 h-4 text-cyan-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black'
                      : 'bg-white/[0.05] border border-white/10 text-white/80'
                  }`}
                >
                  <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-lg flex items-center justify-center shrink-0 border border-amber-500/20">
                    <User className="w-4 h-4 text-amber-400" />
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-lg flex items-center justify-center shrink-0 border border-cyan-500/20">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/[0.05] border border-white/10">
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Input area */}
      <div className="mt-4 flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasDocuments ? "Ask a question about the documents..." : "Upload documents first..."}
            disabled={!hasDocuments || sending}
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending || !hasDocuments}
          className="px-5 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center gap-2"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send
        </button>
      </div>
    </div>
  )
}

// ─── Biodata Modal ─────────────────────────────────────────────────────────────

function BiodataModal({
  profile,
  onUpdate,
  onClose,
}: {
  profile: Profile
  onUpdate: (profile: Profile) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState<ProfileBiodata>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData({
      name: profile.name,
      dateOfBirth: profile.dateOfBirth || '',
      nationality: profile.nationality || '',
      passportNumber: profile.passportNumber || '',
      passportExpiry: profile.passportExpiry || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.address || '',
      city: profile.city || '',
      country: profile.country || '',
      occupation: profile.occupation || '',
      employer: profile.employer || '',
      notes: profile.notes || '',
    })
  }, [profile])

  function handleChange(key: keyof ProfileBiodata, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateProfile(profile.id, formData)
      onUpdate(updated)
      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white">Edit Client</h3>
              <p className="text-xs text-white/40">Update client biodata information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-4">
            {BIODATA_FIELDS.map((field) => (
              <div key={field.key} className={field.key === 'address' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-white/50 mb-2">
                  {field.label}
                </label>
                <input
                  type={field.type || 'text'}
                  value={(formData[field.key] as string) || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            ))}

            {/* Notes field - full width */}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-white/50 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Additional notes about this client..."
                rows={3}
                className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-5 border-t border-white/5">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
