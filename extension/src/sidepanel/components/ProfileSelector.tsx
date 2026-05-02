import { useState, useEffect } from 'react'

interface Profile {
  id: string
  name: string
}

interface ProfileSelectorProps {
  selectedProfileId: string | null
  onSelect: (profileId: string | null) => void
  getToken: () => Promise<string | null>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ProfileSelector({
  selectedProfileId,
  onSelect,
  getToken,
}: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      if (!token) return

      const response = await fetch(`${API_URL}/api/profiles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfiles(data)

        // Auto-select first profile if none selected
        if (!selectedProfileId && data.length > 0) {
          onSelect(data[0].id)
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
            clipRule="evenodd"
          />
        </svg>
        {isLoading ? (
          <span className="text-gray-500">Loading...</span>
        ) : selectedProfile ? (
          <span>{selectedProfile.name}</span>
        ) : (
          <span className="text-gray-500">No profile</span>
        )}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {profiles.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">
              No profiles yet. Ask the agent to create one!
            </div>
          ) : (
            <ul className="py-1">
              {profiles.map((profile) => (
                <li key={profile.id}>
                  <button
                    onClick={() => {
                      onSelect(profile.id)
                      setIsOpen(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      profile.id === selectedProfileId ? 'bg-blue-50 text-blue-600' : ''
                    }`}
                  >
                    <div className="font-medium">{profile.name}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t">
            <button
              onClick={() => {
                loadProfiles()
                setIsOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Refresh profiles
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
