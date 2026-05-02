import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2 } from 'lucide-react'
import { useOrganization } from '../contexts/OrganizationContext'

export default function NewOrganization() {
  const navigate = useNavigate()
  const { createOrg } = useOrganization()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40)
  }

  function handleNameChange(value: string) {
    setName(value)
    // Auto-generate slug from name if slug hasn't been manually edited
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required')
      return
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug must be lowercase letters, numbers, and hyphens only')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await createOrg(name.trim(), slug.trim())
      navigate('/app')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to dashboard</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white">Create Organization</h1>
              <p className="text-white/40 text-sm">Set up a new workspace for your team</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Organization name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Immigration Law"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Organization slug
              </label>
              <div className="flex items-center">
                <span className="px-4 py-3 bg-white/[0.02] border border-r-0 border-white/10 rounded-l-xl text-white/40 text-sm">
                  visa-agent.app/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="acme-law"
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-r-xl text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <p className="mt-2 text-xs text-white/40">
                Lowercase letters, numbers, and hyphens only. This cannot be changed later.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="flex-1 px-6 py-3 bg-white/5 text-white/70 font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !slug.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
