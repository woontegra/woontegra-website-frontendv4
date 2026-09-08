/**
 * Metni panoya kopyalar.
 * Önce Clipboard API; olmazsa textarea + execCommand yedeği.
 */
export async function copyTextToClipboard(text: string): Promise<void> {
  const value = String(text ?? '')
  if (!value) {
    throw new Error('Kopyalanacak metin boş')
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value)
      return
    } catch {
      // yedek yönteme düş
    }
  }

  copyTextWithExecCommand(value)
}

function copyTextWithExecCommand(text: string): void {
  if (typeof document === 'undefined') {
    throw new Error('Pano kullanılamıyor')
  }

  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.top = '0'
  ta.style.left = '0'
  ta.style.width = '1px'
  ta.style.height = '1px'
  ta.style.padding = '0'
  ta.style.border = 'none'
  ta.style.outline = 'none'
  ta.style.boxShadow = 'none'
  ta.style.background = 'transparent'
  ta.style.opacity = '0'
  document.body.appendChild(ta)

  ta.focus()
  ta.select()
  ta.setSelectionRange(0, text.length)

  let ok = false
  try {
    ok = document.execCommand('copy')
  } finally {
    document.body.removeChild(ta)
  }

  if (!ok) {
    throw new Error('Pano kopyalama başarısız')
  }
}

export const CLIPBOARD_COPY_ERROR_TR =
  'Bağlantı kopyalanamadı. Lütfen metni seçip manuel olarak kopyalayın.'
