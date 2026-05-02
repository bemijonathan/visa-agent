import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Loader2, AlertCircle, Send, Bot, User, Save, Download,
  Check, X, RotateCcw
} from 'lucide-react'
import { Document as DocxDocument, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import {
  getLetter, updateLetter, approveLetter, rejectLetter,
  improveLetter, Letter, LetterStatus
} from '../lib/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const STATUS_STYLES: Record<LetterStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'bg-white/10', text: 'text-white/60', label: 'Draft' },
  APPROVED: { bg: 'bg-emerald-500/10 border border-emerald-500/20', text: 'text-emerald-400', label: 'Approved' },
  REJECTED: { bg: 'bg-red-500/10 border border-red-500/20', text: 'text-red-400', label: 'Rejected' },
}

export default function LetterEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [letter, setLetter] = useState<Letter | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [improving, setImproving] = useState(false)

  const [editedContent, setEditedContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (id) loadLetter(id)
  }, [id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (letter) {
      setEditedContent(letter.content)
      setHasChanges(false)
    }
  }, [letter])

  async function loadLetter(letterId: string) {
    try {
      setLoading(true)
      setError(null)
      const l = await getLetter(letterId)
      setLetter(l)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load letter')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || improving || !letter) return

    const userMessage = input.trim()
    setInput('')
    setImproving(true)

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)

    try {
      const { content: improvedContent, message } = await improveLetter(letter.id, userMessage, editedContent)
      setEditedContent(improvedContent)
      setHasChanges(true)
      setMessages([...newMessages, { role: 'assistant', content: message || 'I\'ve updated the letter based on your feedback.' }])
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${err instanceof Error ? err.message : 'Failed to improve letter'}` }])
    } finally {
      setImproving(false)
    }
  }

  async function handleSave() {
    if (!letter || !hasChanges) return
    setSaving(true)
    try {
      const updated = await updateLetter(letter.id, { content: editedContent })
      setLetter(updated)
      setHasChanges(false)
      setIsEditing(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function handleApprove() {
    if (!letter) return
    try {
      const updated = await approveLetter(letter.id)
      setLetter(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve')
    }
  }

  async function handleReject() {
    if (!letter) return
    try {
      const updated = await rejectLetter(letter.id)
      setLetter(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject')
    }
  }

  async function handleResetToDraft() {
    if (!letter) return
    try {
      const updated = await updateLetter(letter.id, { status: 'DRAFT' })
      setLetter(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset')
    }
  }

  function handleDownloadDocx() {
    if (!letter) return
    const paragraphs = editedContent.split('\n').map(line => {
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

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${letter.name.replace(/[^a-zA-Z0-9]/g, '-')}.docx`)
    }).catch(err => {
      console.error('Failed to generate DOCX', err)
      alert('Failed to generate DOCX file')
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error || !letter) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="p-8 max-w-sm w-full text-center rounded-2xl bg-white/[0.02] border border-white/5">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="font-medium text-white mb-6">{error ?? 'Letter not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full px-5 py-3 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const status = letter.status || 'DRAFT'
  const statusStyle = STATUS_STYLES[status]

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 z-10 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-lg font-bold text-white truncate">{letter.name}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusStyle.bg} ${statusStyle.text}`}>
                {statusStyle.label}
              </span>
            </div>
            <p className="text-xs text-white/30 mt-0.5">
              {new Date(letter.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-400 to-green-500 text-black rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            )}

            {status === 'DRAFT' && (
              <>
                <button
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}

            {status !== 'DRAFT' && (
              <button
                onClick={handleResetToDraft}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Draft
              </button>
            )}

            <button
              onClick={handleDownloadDocx}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex max-w-7xl mx-auto w-full min-h-0">
        {/* Chat Panel - Left */}
        <div className="w-[400px] border-r border-white/5 flex flex-col min-h-0">
          <div className="shrink-0 p-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Improve Letter</h2>
            <p className="text-xs text-white/40 mt-1">Chat to refine and improve the letter</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400/20 to-violet-500/10 rounded-xl flex items-center justify-center mb-3 border border-purple-500/20">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <p className="text-white/50 text-sm font-medium mb-2">AI Letter Assistant</p>
                <p className="text-white/30 text-xs max-w-[250px]">
                  Tell me how you'd like to improve this letter. For example:
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    'Make it more formal',
                    'Add more details about my employment',
                    'Shorten the letter',
                    'Fix the grammar and tone',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="block w-full px-3 py-2 text-xs font-medium bg-white/5 text-white/60 rounded-lg hover:bg-white/10 hover:text-white/80 transition-colors text-left"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-400/20 to-violet-500/10 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/20">
                        <Bot className="w-3.5 h-3.5 text-purple-400" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                          : 'bg-white/[0.05] border border-white/10 text-white/80'
                      }`}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-7 h-7 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-lg flex items-center justify-center shrink-0 border border-amber-500/20">
                        <User className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    )}
                  </div>
                ))}
                {improving && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-400/20 to-violet-500/10 rounded-lg flex items-center justify-center shrink-0 border border-purple-500/20">
                      <Bot className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10">
                      <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="shrink-0 p-4 border-t border-white/5">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="How should I improve this letter?"
                rows={2}
                className="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || improving}
                className="px-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Letter Canvas - Right */}
        <div className="flex-1 flex flex-col p-6 min-h-0">
          <div className="shrink-0 flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/70">Letter Content</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              {isEditing ? 'Preview' : 'Edit manually'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl bg-white/[0.02] border border-white/5">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => {
                  setEditedContent(e.target.value)
                  setHasChanges(true)
                }}
                className="w-full h-full p-6 bg-transparent text-white/90 text-sm leading-relaxed font-sans resize-none focus:outline-none"
                placeholder="Letter content..."
              />
            ) : (
              <div className="p-6">
                <div className="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed whitespace-pre-wrap">
                  {editedContent}
                </div>
              </div>
            )}
          </div>

          {hasChanges && (
            <div className="shrink-0 mt-4 flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-sm text-amber-400">You have unsaved changes</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditedContent(letter.content)
                    setHasChanges(false)
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white/60 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
