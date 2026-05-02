import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { listOrganizations, createOrganization, Organization } from '../lib/api'

interface OrganizationContextType {
  organizations: Organization[]
  currentOrganization: Organization | null
  loading: boolean
  error: string | null
  setCurrentOrganization: (org: Organization | null) => void
  refreshOrganizations: () => Promise<void>
  createOrg: (name: string, slug: string) => Promise<Organization>
}

const OrganizationContext = createContext<OrganizationContextType | null>(null)

const CURRENT_ORG_KEY = 'visa-agent-current-org'

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { user, loading: authLoading } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setCurrentOrganization = (org: Organization | null) => {
    setCurrentOrganizationState(org)
    if (org) {
      localStorage.setItem(CURRENT_ORG_KEY, org.id)
    } else {
      localStorage.removeItem(CURRENT_ORG_KEY)
    }
  }

  const refreshOrganizations = async () => {
    if (!user) {
      setOrganizations([])
      setCurrentOrganizationState(null)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const orgs = await listOrganizations()
      setOrganizations(orgs)

      // Restore previously selected org or select first one
      const savedOrgId = localStorage.getItem(CURRENT_ORG_KEY)
      const savedOrg = orgs.find((o) => o.id === savedOrgId)

      if (savedOrg) {
        setCurrentOrganizationState(savedOrg)
      } else if (orgs.length > 0) {
        setCurrentOrganization(orgs[0])
      } else {
        setCurrentOrganizationState(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  const createOrg = async (name: string, slug: string): Promise<Organization> => {
    const org = await createOrganization({ name, slug })
    await refreshOrganizations()
    setCurrentOrganization(org)
    return org
  }

  useEffect(() => {
    if (!authLoading) {
      refreshOrganizations()
    }
  }, [user, authLoading])

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        loading: loading || authLoading,
        error,
        setCurrentOrganization,
        refreshOrganizations,
        createOrg,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}
