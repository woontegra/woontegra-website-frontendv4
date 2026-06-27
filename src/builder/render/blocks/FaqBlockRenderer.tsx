import { useState } from 'react'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import type { FaqBlock } from '@/builder/types'

export function FaqBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'faq') return null
  const b = block as FaqBlock
  if (!b.visibility.enabled) return null

  const items = b.settings.items.filter(
    (item) => renderIfText(item.question) && renderIfText(item.answer),
  )
  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))

  if (items.length === 0 && !hasHeader) return null

  return (
    <SectionBlockShell style={b.style}>
      <BlockSectionHeader
        title={b.title}
        description={b.description}
        showTitle={b.visibility.showTitle}
        showDescription={b.visibility.showDescription}
      />
      {items.length > 0 ? (
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {items.map((item) => (
            <FaqItemRow key={item.id} id={item.id} question={item.question} answer={item.answer} />
          ))}
        </div>
      ) : null}
    </SectionBlockShell>
  )
}

function FaqItemRow({ id, question, answer }: { id: string; question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="px-4 py-3">
      <BuilderField path={`item.${id}.question`} label="Soru" type="faq" className="w-full">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 text-left text-sm font-medium text-slate-900"
        >
          <span>{question}</span>
          <span className="text-slate-400">{open ? '−' : '+'}</span>
        </button>
      </BuilderField>
      {open ? (
        <BuilderField path={`item.${id}.answer`} label="Cevap" type="faq" className="mt-2 w-full">
          <p className="text-sm text-slate-600">{answer}</p>
        </BuilderField>
      ) : null}
    </div>
  )
}
