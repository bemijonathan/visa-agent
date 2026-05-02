import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, Users, Mail, Trash2, Crown, Shield, User } from 'lucide-react'
import { useOrganization } from '../contexts/OrganizationContext'
import {
  getOrganization,
  inviteMember,
  removeMember,
  updateMemberRole,
  leaveOrganization,
  deleteOrganization,
  OrganizationDetails,
  OrganizationMember,
} from '../lib/api'

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
}

const roleColors = {
  OWNER: 'text-amber-400 bg-amber-500/10',
  ADMIN: 'text-purple-400 bg-purple-500/10',
  MEMBER: 'text-white/60 bg-white/5',
}

export default function OrgSettings() {
  const navigate = useNavigate()
  const { currentOrganization, refreshOrganizations } = useOrganization()
  const [orgDetails, setOrgDetails] = useState<OrganizationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentOrganization) {
      loadOrgDetails()
    }
  }, [currentOrganization?.id])

  async function loadOrgDetails() {
    if (!currentOrganization) return

    try {
      setLoading(true)
      const details = await getOrganization(currentOrganization.id)
      setOrgDetails(details)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!currentOrganization || !inviteEmail.trim()) return

    try {
      setInviting(true)
      setError(null)
      await inviteMember(currentOrganization.id, inviteEmail.trim(), inviteRole)
      setInviteEmail('')
      await loadOrgDetails()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(member: OrganizationMember) {
    if (!currentOrganization) return
    if (!confirm(`Remove ${member.displayName || member.email} from the organization?`)) return

    try {
      await removeMember(currentOrganization.id, member.id)
      await loadOrgDetails()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleChangeRole(member: OrganizationMember, newRole: 'OWNER' | 'ADMIN' | 'MEMBER') {
    if (!currentOrganization) return

    try {
      await updateMemberRole(currentOrganization.id, member.id, newRole)
      await loadOrgDetails()
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleLeave() {
    if (!currentOrganization) return
    if (!confirm('Are you sure you want to leave this organization?')) return

    try {
      await leaveOrganization(currentOrganization.id)
      await refreshOrganizations()
      navigate('/app')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete() {
    if (!currentOrganization) return
    if (!confirm(`Delete "${currentOrganization.name}"? This action cannot be undone.`)) return

    try {
      await deleteOrganization(currentOrganization.id)
      await refreshOrganizations()
      navigate('/app')
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (!currentOrganization) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50">No organization selected</p>
      </div>
    )
  }

  const isOwner = orgDetails?.currentUserRole === 'OWNER'
  const isAdmin = orgDetails?.currentUserRole === 'ADMIN' || isOwner

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-6">
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
              <h1 className="font-display text-2xl font-bold text-white">{currentOrganization.name}</h1>
              <p className="text-white/40 text-sm">Organization settings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Members Section */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-white/60" />
              <h2 className="font-semibold text-white">Members</h2>
            </div>
            <span className="text-sm text-white/40">
              {orgDetails?.members.length || 0} member{orgDetails?.members.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Invite Form */}
          {isAdmin && (
            <form onSubmit={handleInvite} className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
                >
                  {inviting ? 'Inviting...' : 'Invite'}
                </button>
              </div>
            </form>
          )}

          {/* Member List */}
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              orgDetails?.members.map((member) => {
                const RoleIcon = roleIcons[member.role]
                return (
                  <div key={member.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {member.displayName || member.email}
                      </p>
                      <p className="text-white/40 text-sm truncate">{member.email}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${roleColors[member.role]}`}>
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium capitalize">{member.role.toLowerCase()}</span>
                    </div>
                    {isOwner && member.role !== 'OWNER' && (
                      <div className="flex items-center gap-2">
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member, e.target.value as any)}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none"
                        >
                          <option value="MEMBER">Member</option>
                          <option value="ADMIN">Admin</option>
                          <option value="OWNER">Owner</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl bg-red-500/5 border border-red-500/10 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-500/10">
            <h2 className="font-semibold text-red-400">Danger Zone</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Leave organization</p>
                <p className="text-white/40 text-sm">Remove yourself from this organization</p>
              </div>
              <button
                onClick={handleLeave}
                className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Leave
              </button>
            </div>

            {isOwner && (
              <div className="flex items-center justify-between pt-4 border-t border-red-500/10">
                <div>
                  <p className="text-white font-medium">Delete organization</p>
                  <p className="text-white/40 text-sm">Permanently delete this organization and all data</p>
                </div>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
