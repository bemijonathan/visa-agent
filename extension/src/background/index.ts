// Service worker for the extension

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

  if (message.type === 'GET_FORM_FIELDS') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0]?.id
      if (!tabId) { sendResponse({ error: 'No active tab' }); return }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const fields: Array<{ selector: string; label: string; type: string; options?: string[] }> = []
            const seen = new Set<string>()
            const inputs = document.querySelectorAll<HTMLElement>('input, select, textarea')

            for (const el of inputs) {
              if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) continue
              const tagName = el.tagName.toLowerCase()
              const type = el instanceof HTMLInputElement ? el.type.toLowerCase() : tagName
              if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue

              let selector = ''
              if (el.id) selector = `#${el.id}`
              else if ((el as any).name) selector = `${tagName}[name="${(el as any).name}"]`
              else continue

              if (seen.has(selector)) continue
              seen.add(selector)

              let label = ''
              if (el.id) {
                const labelEl = document.querySelector(`label[for="${el.id}"]`)
                if (labelEl) label = labelEl.textContent?.trim() || ''
              }
              if (!label) {
                const parent = el.closest('label')
                if (parent) label = parent.textContent?.trim() || ''
              }
              if (!label && el instanceof HTMLInputElement) label = el.placeholder || el.name || el.id
              if (!label) label = (el as any).name || el.id
              if (!label) continue

              const field: { selector: string; label: string; type: string; options?: string[] } = { selector, label, type }

              if (el instanceof HTMLSelectElement) {
                field.options = Array.from(el.options).filter(o => o.value).map(o => o.text.trim())
              }
              if (el instanceof HTMLInputElement && type === 'radio' && el.name) {
                const radios = document.querySelectorAll<HTMLInputElement>(`input[name="${el.name}"]`)
                field.options = Array.from(radios).map(r => r.value)
              }

              fields.push(field)
            }
            return fields
          },
        })
        sendResponse({ fields: results[0]?.result ?? [] })
      } catch (error: any) {
        sendResponse({ error: `Failed to scan page: ${error.message}` })
      }
    })
    return true
  }

  if (message.type === 'FILL_FORM') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0]?.id
      if (!tabId) { sendResponse({ error: 'No active tab' }); return }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: (fieldValues: Array<{ selector: string; value: string }>) => {
            let filled = 0
            for (const { selector, value } of fieldValues) {
              try {
                const el = document.querySelector<HTMLElement>(selector)
                if (!el) continue

                if (el instanceof HTMLInputElement) {
                  const type = el.type.toLowerCase()
                  if (type === 'checkbox') {
                    el.checked = ['true', '1', 'yes'].includes(value.toLowerCase())
                  } else if (type === 'radio') {
                    const radios = document.querySelectorAll<HTMLInputElement>(`input[name="${el.name}"]`)
                    for (const r of radios) {
                      if (r.value.toLowerCase() === value.toLowerCase()) { r.checked = true; break }
                    }
                  } else if (type === 'date') {
                    const d = new Date(value)
                    el.value = isNaN(d.getTime()) ? value : d.toISOString().split('T')[0]
                  } else {
                    el.value = value
                  }
                } else if (el instanceof HTMLSelectElement) {
                  const lower = value.toLowerCase()
                  const match = Array.from(el.options).find(
                    o => o.value.toLowerCase() === lower || o.text.toLowerCase().includes(lower)
                  )
                  el.value = match ? match.value : value
                } else if (el instanceof HTMLTextAreaElement) {
                  el.value = value
                }

                el.dispatchEvent(new Event('input', { bubbles: true }))
                el.dispatchEvent(new Event('change', { bubbles: true }))
                filled++
              } catch { /* bad selector, skip */ }
            }
            return filled
          },
          args: [message.fieldValues],
        })
        sendResponse({ success: true, filled: results[0]?.result ?? 0 })
      } catch (error: any) {
        sendResponse({ error: `Failed to fill form: ${error.message}` })
      }
    })
    return true
  }

  if (message.type === 'GET_FILE_FIELDS') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0]?.id
      if (!tabId) { sendResponse({ error: 'No active tab' }); return }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const fields: Array<{ selector: string; label: string; accept: string }> = []
            const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]')

            for (const el of fileInputs) {
              let selector = ''
              if (el.id) selector = `#${el.id}`
              else if (el.name) selector = `input[type="file"][name="${el.name}"]`
              else continue

              let label = ''
              if (el.id) {
                const labelEl = document.querySelector(`label[for="${el.id}"]`)
                if (labelEl) label = labelEl.textContent?.trim() || ''
              }
              if (!label) {
                const parent = el.closest('label')
                if (parent) label = parent.textContent?.trim() || ''
              }
              if (!label) label = el.name || el.id || 'File upload'

              fields.push({ selector, label, accept: el.accept || '*/*' })
            }
            return fields
          },
        })
        sendResponse({ fields: results[0]?.result ?? [] })
      } catch (error: any) {
        sendResponse({ error: `Failed to scan file fields: ${error.message}` })
      }
    })
    return true
  }

  if (message.type === 'FILL_FILE_FIELD') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tabId = tabs[0]?.id
      if (!tabId) { sendResponse({ error: 'No active tab' }); return }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: (selector: string, base64Data: string, fileName: string, mimeType: string) => {
            const el = document.querySelector<HTMLInputElement>(selector)
            if (!el || el.type !== 'file') throw new Error('File input not found')

            // Convert base64 to blob
            const byteCharacters = atob(base64Data)
            const byteNumbers = new Array(byteCharacters.length)
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i)
            }
            const byteArray = new Uint8Array(byteNumbers)
            const blob = new Blob([byteArray], { type: mimeType })

            // Create File and set it
            const file = new File([blob], fileName, { type: mimeType })
            const dataTransfer = new DataTransfer()
            dataTransfer.items.add(file)
            el.files = dataTransfer.files

            el.dispatchEvent(new Event('input', { bubbles: true }))
            el.dispatchEvent(new Event('change', { bubbles: true }))
            return true
          },
          args: [message.selector, message.fileData, message.fileName, message.mimeType],
        })
        sendResponse({ success: results[0]?.result ?? false })
      } catch (error: any) {
        sendResponse({ error: `Failed to fill file: ${error.message}` })
      }
    })
    return true
  }

})
