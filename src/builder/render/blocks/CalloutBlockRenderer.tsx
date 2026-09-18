import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import { looksLikeHtml, sanitizeRichHtml } from '@/builder/lib/richTextHtml'
import type { CalloutBlock, CalloutTone } from '@/builder/types/contentBlocks'
import { cn } from '@/lib/cn'

const TONE_STYLES: Record<CalloutTone, string> = {
  info: 'border-sky-200 bg-sky-50 text-sky-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950',
  note: 'border-slate-200 bg-slate-50 text-slate-900',
}

export function CalloutBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'callout') return null
  const b = block as CalloutBlock
  if (!b.visibility.enabled) return null

  const tone = b.settings.tone || 'info'
  const body = renderIfText(b.settings.body)
  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))
  if (!body && !hasHeader) return null

  return (
    <SectionBlockShell style={b.style}>
      <div className={cn('rounded-2xl border px-5 py-4 sm:px-6 sm:py-5', TONE_STYLES[tone])}>
        <BlockSectionHeader
          title={b.title}
          description={b.description}
          showTitle={b.visibility.showTitle}
          showDescription={b.visibility.showDescription}
        />
        {body ? (
          looksLikeHtml(body) ? (
            <div
              className="prose prose-sm max-w-none mt-2"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(body) }}
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{body}</p>
          )
        ) : null}
      </div>
    </SectionBlockShell>
  )
}
