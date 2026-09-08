import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { copyTextToClipboard } from '@/lib/copyTextToClipboard'

describe('copyTextToClipboard', () => {
  const writeText = vi.fn()

  beforeEach(() => {
    writeText.mockReset()
    writeText.mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('uses Clipboard API when available', async () => {
    await copyTextToClipboard('https://example.com/r/abc')
    expect(writeText).toHaveBeenCalledWith('https://example.com/r/abc')
  })

  it('falls back to execCommand when Clipboard API fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    const execCommand = vi.fn().mockReturnValue(true)
    const appendChild = vi.fn()
    const removeChild = vi.fn()
    const focus = vi.fn()
    const select = vi.fn()
    const setSelectionRange = vi.fn()
    const ta = {
      value: '',
      style: {} as Record<string, string>,
      setAttribute: vi.fn(),
      focus,
      select,
      setSelectionRange,
    }
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ta),
      body: { appendChild, removeChild },
      execCommand,
    })

    await copyTextToClipboard('https://example.com/r/xyz')
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(ta.value).toBe('https://example.com/r/xyz')
    expect(removeChild).toHaveBeenCalled()
  })

  it('rejects empty text', async () => {
    await expect(copyTextToClipboard('')).rejects.toThrow(/boş/i)
  })

  it('rejects when fallback also fails', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        value: '',
        style: {},
        setAttribute: vi.fn(),
        focus: vi.fn(),
        select: vi.fn(),
        setSelectionRange: vi.fn(),
      })),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
      execCommand: vi.fn().mockReturnValue(false),
    })
    await expect(copyTextToClipboard('https://example.com/r/fail')).rejects.toThrow(/başarısız/i)
  })
})
