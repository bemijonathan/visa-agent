// Content script for form detection and filling

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_FORM_FIELDS') {
    try {
      sendResponse({ fields: extractFormFields() })
    } catch (error: any) {
      sendResponse({ error: error.message })
    }
  }

  if (message.type === 'GET_FILE_FIELDS') {
    try {
      sendResponse({ fields: extractFileFields() })
    } catch (error: any) {
      sendResponse({ error: error.message })
    }
  }

  if (message.type === 'EXECUTE_FILL') {
    try {
      const filled = fillFormFields(message.fieldValues)
      sendResponse({ success: true, filled })
    } catch (error: any) {
      sendResponse({ error: error.message })
    }
  }

  if (message.type === 'FILL_FILE_FIELD') {
    fillFileField(message.selector, message.fileData, message.fileName, message.mimeType)
      .then(() => sendResponse({ success: true }))
      .catch((error: any) => sendResponse({ error: error.message }))
    return true // Keep channel open for async response
  }

  return true
})

interface FieldInfo {
  selector: string   // exact CSS selector to find the element
  label: string      // human-readable label for RAG query
  type: string
  options?: string[] // for select/radio
}

function extractFormFields(): FieldInfo[] {
  const fields: FieldInfo[] = []
  const seen = new Set<string>()

  const inputs = document.querySelectorAll<HTMLElement>('input, select, textarea')

  for (const el of inputs) {
    if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement)) continue

    const tagName = el.tagName.toLowerCase()
    const type = el instanceof HTMLInputElement ? el.type.toLowerCase() : tagName

    // Skip hidden, submit, button, reset, image
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) continue

    // Build the best unique selector
    let selector = ''
    if (el.id) {
      selector = `#${CSS.escape(el.id)}`
    } else if (el.name) {
      selector = `${tagName}[name="${CSS.escape(el.name)}"]`
    } else {
      continue // can't reliably target it
    }

    if (seen.has(selector)) continue
    seen.add(selector)

    // Find label text
    let label = ''
    if (el.id) {
      const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      if (labelEl) label = labelEl.textContent?.trim() || ''
    }
    if (!label) {
      // Look for wrapping label
      const parent = el.closest('label')
      if (parent) {
        label = parent.textContent?.replace(el instanceof HTMLInputElement ? el.value : '', '').trim() || ''
      }
    }
    if (!label && el instanceof HTMLInputElement) {
      label = el.placeholder || el.name || el.id
    }
    if (!label) label = el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement ? (el.name || el.id) : ''
    if (!label) continue

    const field: FieldInfo = { selector, label, type }

    // Collect options for select
    if (el instanceof HTMLSelectElement) {
      field.options = Array.from(el.options)
        .filter(o => o.value)
        .map(o => o.text.trim())
    }

    // For radio buttons, collect all options
    if (el instanceof HTMLInputElement && type === 'radio' && el.name) {
      const radios = document.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(el.name)}"]`)
      field.options = Array.from(radios).map(r => r.value)
    }

    fields.push(field)
  }

  return fields
}

function fillFormFields(fieldValues: Array<{ selector: string; value: string }>): number {
  let filled = 0
  for (const { selector, value } of fieldValues) {
    try {
      const el = document.querySelector<HTMLElement>(selector)
      if (el) {
        fillElement(el, value)
        filled++
      }
    } catch {
      // invalid selector, skip
    }
  }
  return filled
}

function fillElement(element: HTMLElement, value: string) {
  if (element instanceof HTMLInputElement) {
    const type = element.type.toLowerCase()
    if (type === 'checkbox') {
      element.checked = ['true', '1', 'yes'].includes(value.toLowerCase())
    } else if (type === 'radio') {
      const radios = document.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(element.name)}"]`)
      for (const radio of radios) {
        if (radio.value.toLowerCase() === value.toLowerCase()) {
          radio.checked = true
          radio.dispatchEvent(new Event('change', { bubbles: true }))
          break
        }
      }
      return
    } else if (type === 'date') {
      element.value = formatDate(value)
    } else {
      element.value = value
    }
  } else if (element instanceof HTMLSelectElement) {
    const lower = value.toLowerCase()
    const match = Array.from(element.options).find(
      o => o.value.toLowerCase() === lower || o.text.toLowerCase() === lower || o.text.toLowerCase().includes(lower)
    )
    element.value = match ? match.value : value
  } else if (element instanceof HTMLTextAreaElement) {
    element.value = value
  }

  element.dispatchEvent(new Event('input', { bubbles: true }))
  element.dispatchEvent(new Event('change', { bubbles: true }))
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (!isNaN(date.getTime())) return date.toISOString().split('T')[0]
  return value
}

interface FileFieldInfo {
  selector: string
  label: string
  accept: string
}

function extractFileFields(): FileFieldInfo[] {
  const fields: FileFieldInfo[] = []
  const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]')

  for (const el of fileInputs) {
    let selector = ''
    if (el.id) {
      selector = `#${CSS.escape(el.id)}`
    } else if (el.name) {
      selector = `input[type="file"][name="${CSS.escape(el.name)}"]`
    } else {
      continue
    }

    // Find label text
    let label = ''
    if (el.id) {
      const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      if (labelEl) label = labelEl.textContent?.trim() || ''
    }
    if (!label) {
      const parent = el.closest('label')
      if (parent) {
        label = parent.textContent?.trim() || ''
      }
    }
    if (!label) {
      label = el.name || el.id || 'File upload'
    }

    fields.push({
      selector,
      label,
      accept: el.accept || '*/*',
    })
  }

  return fields
}

async function fillFileField(selector: string, base64Data: string, fileName: string, mimeType: string): Promise<void> {
  const el = document.querySelector<HTMLInputElement>(selector)
  if (!el || el.type !== 'file') {
    throw new Error('File input not found')
  }

  // Convert base64 to blob
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  const blob = new Blob([byteArray], { type: mimeType })

  // Create a File object
  const file = new File([blob], fileName, { type: mimeType })

  // Create a DataTransfer to set the file
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(file)
  el.files = dataTransfer.files

  // Dispatch events
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
}

