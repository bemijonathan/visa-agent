import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Plus, FileText, AlertCircle, Loader2, Trash2, Building2 } from 'lucide-react'
import { listProfiles, deleteProfile, Profile } from '../lib/api'
import { useOrganization } from '../contexts/OrganizationContext'

export default function ClientList() {
  const navigate = useNavigate()
  const { currentOrganization, loading: orgLoading } = useOrganization()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (currentOrganization) {
      load()
    } else if (!orgLoading) {
      setLoading(false)
    }
  }, [currentOrganization?.id, orgLoading])

  async function load() {
    try {
      setLoading(true)
      setError(null)
      setProfiles(await listProfiles())
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (!confirm('Delete this client and all their documents?')) return
    setDeletingId(id)
    try {
      await deleteProfile(id)
      setProfiles((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  // No organization state - prompt to create one
  if (!orgLoading && !currentOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <Building2 className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">Create your organization</h2>
          <p className="text-white/50 mb-8 max-w-md">
            Organizations help you organize clients and collaborate with your team
          </p>
          <button
            onClick={() => navigate('/organizations/new')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-white">Clients</h2>
          <p className="text-white/50 mt-2">Upload documents and let the agent handle the rest</p>
        </div>
        <button
          onClick={() => navigate('/clients/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          New Client
        </button>
      </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm flex-1">{error}</p>
            <button
              onClick={load}
              className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && profiles.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
              <Users className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-white mb-3">No clients yet</h3>
            <p className="text-white/50 mb-8 max-w-md mx-auto">
              Create a client, upload their documents, and the agent fills visa forms automatically
            </p>
            <button
              onClick={() => navigate('/clients/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-sm font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add First Client
            </button>
          </div>
        )}

        {!loading && !error && profiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const docCount = profile.documents?.length ?? 0
              const processed = profile.documents?.filter((d) => d.extractedText).length ?? 0
              const initials = profile.name.slice(0, 2).toUpperCase()

              return (
                <button
                  key={profile.id}
                  onClick={() => navigate(`/clients/${profile.id}`)}
                  className="group relative p-5 text-left rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-amber-500/30 transition-all duration-300 cursor-pointer w-full"
                >
                  <button
                    onClick={(e) => handleDelete(e, profile.id)}
                    disabled={deletingId === profile.id}
                    className="absolute top-3 right-3 p-2 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    {deletingId === profile.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <Trash2 className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400/20 to-orange-500/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                      <span className="text-amber-400 font-bold text-sm">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                        {profile.name}
                      </h3>
                      {profile.notes && (
                        <p className="text-xs text-white/30 truncate mt-0.5">{profile.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/40">
                    <FileText className="w-4 h-4 text-white/20 shrink-0" />
                    {docCount === 0
                      ? <span className="text-white/30 text-xs">No documents</span>
                      : <span className="text-xs">{docCount} doc{docCount !== 1 ? 's' : ''}{processed > 0 ? ` · ${processed} processed` : ''}</span>
                    }
                  </div>
                </button>
              )
            })}
          </div>
        )}
    </div>
  )
}
