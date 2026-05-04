import { useState, useEffect } from 'react'

const EXTENSION_CHECK_INTERVAL = 5000 // Check every 5 seconds
const BANNER_DISMISSED_KEY = 'visa-agent-extension-banner-dismissed'

export function useExtensionDetection() {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null)
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(BANNER_DISMISSED_KEY) === 'true'
  })

  useEffect(() => {
    const checkExtension = () => {
      // The extension injects a data attribute on the body when active
      const extensionMarker = document.body.dataset.visaAgentExtension === 'true'

      // Alternative: check for injected element
      const injectedElement = document.getElementById('visa-agent-extension-marker')

      // Alternative: try to communicate via custom event
      let responded = false
      const handleResponse = () => {
        responded = true
        setIsInstalled(true)
      }

      window.addEventListener('visa-agent-extension-pong', handleResponse, { once: true })
      window.dispatchEvent(new CustomEvent('visa-agent-extension-ping'))

      // Give extension time to respond
      setTimeout(() => {
        window.removeEventListener('visa-agent-extension-pong', handleResponse)
        if (!responded) {
          setIsInstalled(extensionMarker || !!injectedElement)
        }
      }, 100)
    }

    // Initial check
    checkExtension()

    // Periodic check
    const interval = setInterval(checkExtension, EXTENSION_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const dismissBanner = () => {
    setBannerDismissed(true)
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true')
  }

  const resetBannerDismissal = () => {
    setBannerDismissed(false)
    localStorage.removeItem(BANNER_DISMISSED_KEY)
  }

  return {
    isInstalled,
    isLoading: isInstalled === null,
    bannerDismissed,
    dismissBanner,
    resetBannerDismissal,
    showBanner: isInstalled === false && !bannerDismissed
  }
}
