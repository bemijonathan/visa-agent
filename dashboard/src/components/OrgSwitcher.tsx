import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Building2, Plus, Settings, Check } from 'lucide-react'
import { useOrganization } from '../contexts/OrganizationContext'

export default function OrgSwitcher() {
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!currentOrganization) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
      >
        <Building2 className="w-4 h-4 text-white/60" />
        <span className="text-sm font-medium text-white max-w-[150px] truncate">
          {currentOrganization.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="p-2">
            <p className="px-3 py-2 text-[10px] font-medium text-white/40 uppercase tracking-wide">
              Organizations
            </p>

            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setCurrentOrganization(org)
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{org.name}</p>
                  <p className="text-xs text-white/40 capitalize">{org.role.toLowerCase()}</p>
                </div>
                {org.id === currentOrganization.id && (
                  <Check className="w-4 h-4 text-amber-400" />
                )}
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 p-2">
            <button
              onClick={() => {
                navigate('/organizations/new')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">Create organization</span>
            </button>

            <button
              onClick={() => {
                navigate('/organizations/settings')
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Settings className="w-4 h-4 text-white/60" />
              </div>
              <span className="text-sm text-white/60">Organization settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
