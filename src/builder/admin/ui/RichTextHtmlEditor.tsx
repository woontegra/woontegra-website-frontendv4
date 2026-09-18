import { useEffect, useRef, type ReactNode } from 'react'
import { Bold, Heading2, Heading3, Link as LinkIcon, List, ListOrdered } from 'lucide-react'
import { looksLikeHtml, sanitizeRichHtml } from '@/builder/lib/richTextHtml'
import { cn } from '@/lib/cn'

type Props = {
  label: string
  value: string
  onChange: (html: string) => void
  hint?: string
}

function runCommand(command: string, value?: string) {
  document.execCommand(command, false, value)
}

/** Lightweight rich editor — H2/H3, bold, link, lists. Stores sanitized HTML. */
export function RichTextHtmlEditor({ label, value, onChange, hint }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const lastEmitted = useRef(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const next = looksLikeHtml(value) ? value : value ? `<p>${escapeText(value).replace(/\n/g, '<br>')}</p>` : ''
    if (next !== lastEmitted.current && el.innerHTML !== next) {
      el.innerHTML = next
    }
  }, [value])

  const emit = () => {
    const el = ref.current
    if (!el) return
    const html = sanitizeRichHtml(el.innerHTML)
    lastEmitted.current = html
    onChange(html)
  }

  const wrapLink = () => {
    const url = window.prompt('Bağlantı URL')
    if (!url) return
    runCommand('createLink', url)
    emit()
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        {hint ? <span className="text-[10px] text-slate-400">{hint}</span> : null}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-0.5 border-b border-slate-100 bg-slate-50 p-1">
          <ToolbarBtn title="Başlık 2" onClick={() => { runCommand('formatBlock', 'H2'); emit() }}>
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Başlık 3" onClick={() => { runCommand('formatBlock', 'H3'); emit() }}>
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Kalın" onClick={() => { runCommand('bold'); emit() }}>
            <Bold className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Bağlantı" onClick={wrapLink}>
            <LinkIcon className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Madde listesi" onClick={() => { runCommand('insertUnorderedList'); emit() }}>
            <List className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Numaralı liste" onClick={() => { runCommand('insertOrderedList'); emit() }}>
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>
        <div
          ref={ref}
          role="textbox"
          aria-label={label}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[160px] max-h-[360px] overflow-y-auto px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none prose prose-sm prose-slate max-w-none"
          onInput={emit}
          onBlur={emit}
        />
      </div>
    </div>
  )
}

function ToolbarBtn({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600',
        'hover:bg-white hover:text-slate-900 hover:shadow-sm',
      )}
    >
      {children}
    </button>
  )
}

function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
