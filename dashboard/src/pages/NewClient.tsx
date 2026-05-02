import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Globe, Loader2, AlertCircle } from 'lucide-react'
import { createProfile } from '../lib/api'

export default function NewClient() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const profile = await createProfile({ name: name.trim(), notes: notes.trim() || undefined })
      navigate(`/clients/${profile.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create client')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/app')}
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white/60" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Globe className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white">New Client</h1>
              <p className="text-xs text-white/40">Upload documents after creating</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-6 py-10">
        {error && (
          <div className="flex items-center gap-3 p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Client Name <span className="text-amber-400">*</span>
            </label>
            <input
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
              placeholder="e.g. Joe Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
            <p className="text-xs text-white/30 mt-2">
              All information will be extracted from the documents you upload.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Notes <span className="text-white/30 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors resize-none"
              rows={3}
              placeholder="Any notes about this client or their application..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="flex-1 px-5 py-3 text-sm font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              ) : (
                'Create Client'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
