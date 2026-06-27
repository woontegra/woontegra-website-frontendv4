import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { BlockSectionHeader, SectionBlockShell } from '@/builder/render/SectionBlockShell'
import { renderIfText } from '@/builder/render/renderRules'
import { resolveIcon } from '@/lib/iconRegistry'
import type { CardGridItem, RichTextBlock } from '@/builder/types'

export function RichTextBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'rich-text') return null
  const b = block as RichTextBlock
  if (!b.visibility.enabled) return null

  const variant = b.settings.variant ?? 'default'

  if (variant === 'about-split') return <AboutSplitVariant block={b} />
  if (variant === 'about-structure') return <AboutStructureVariant block={b} />
  if (variant === 'about-vision') return <AboutVisionVariant block={b} />

  const body = renderIfText(b.settings.body)
  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))

  if (!body && !hasHeader) return null

  return (
    <SectionBlockShell style={b.style}>
      <BlockSectionHeader
        title={b.title}
        description={b.description}
        showTitle={b.visibility.showTitle}
        showDescription={b.visibility.showDescription}
      />
      {body ? (
        <div className="prose prose-slate max-w-none whitespace-pre-wrap text-slate-700">{body}</div>
      ) : null}
    </SectionBlockShell>
  )
}

function AboutSplitVariant({ block }: { block: RichTextBlock }) {
  const paragraphs = (block.settings.paragraphs ?? []).filter((p) => p.trim())
  const highlight = renderIfText(block.settings.highlight)
  const cards = (block.settings.sideCards ?? []).filter((c) => renderIfText(c.title) || renderIfText(c.description))

  return (
    <section
      className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24"
      style={{
        background: block.style.backgroundGradient ?? undefined,
        backgroundColor: block.style.backgroundColor,
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {block.visibility.showTitle !== false && renderIfText(block.title) ? (
              <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{block.title}</h2>
              </BuilderField>
            ) : null}
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              {paragraphs.map((p, index) => (
                <BuilderField
                  key={`p-${index}`}
                  path={`paragraph.${index}`}
                  label={`Paragraf ${index + 1}`}
                  type="text"
                  className="w-fit max-w-full"
                >
                  <p>{p}</p>
                </BuilderField>
              ))}
              {highlight ? (
                <BuilderField path="highlight-text" label="Vurgu metni" type="text" className="w-fit max-w-full">
                  <p className="font-semibold text-slate-900">{highlight}</p>
                </BuilderField>
              ) : null}
            </div>
          </div>
          {cards.length > 0 ? (
            <div className="grid gap-4">
              {cards.map((card) => (
                <SideCard key={card.id} card={card} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function AboutStructureVariant({ block }: { block: RichTextBlock }) {
  const paragraphs = (block.settings.paragraphs ?? []).filter((p) => p.trim())
  const stats = (block.settings.sideCards ?? []).filter((c) => renderIfText(c.title) || renderIfText(c.description))

  return (
    <section
      className="bg-slate-50 py-20 md:py-24"
      style={{
        backgroundColor: block.style.backgroundColor ?? '#f8fafc',
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {block.visibility.showTitle !== false && renderIfText(block.title) ? (
              <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{block.title}</h2>
              </BuilderField>
            ) : null}
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              {paragraphs.map((p, index) => (
                <BuilderField
                  key={`p-${index}`}
                  path={`paragraph.${index}`}
                  label={`Paragraf ${index + 1}`}
                  type="text"
                  className="w-fit max-w-full"
                >
                  <p>{p}</p>
                </BuilderField>
              ))}
            </div>
          </div>
          {stats.length > 0 ? (
            <div className="grid gap-4">
              {stats.map((stat) => {
                const Icon = resolveIcon(stat.icon ?? 'target')
                return (
                  <div key={stat.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      {renderIfText(stat.title) ? (
                        <BuilderField
                          path={`card.${stat.id}.title`}
                          label="Kart Başlığı"
                          type="card"
                          className="w-fit max-w-full"
                        >
                          <h3 className="font-semibold text-slate-900">{stat.title}</h3>
                        </BuilderField>
                      ) : null}
                      {renderIfText(stat.description) ? (
                        <BuilderField
                          path={`card.${stat.id}.description`}
                          label="Kart Açıklaması"
                          type="card"
                          className="w-fit max-w-full"
                        >
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">{stat.description}</p>
                        </BuilderField>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function AboutVisionVariant({ block }: { block: RichTextBlock }) {
  const paragraphs = (block.settings.paragraphs ?? []).filter((p) => p.trim())
  if (!renderIfText(block.title) && paragraphs.length === 0) return null

  return (
    <section
      className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 md:py-24"
      style={{
        background: block.style.backgroundGradient ?? undefined,
        paddingTop: block.style.paddingTop?.desktop,
        paddingBottom: block.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {block.visibility.showTitle !== false && renderIfText(block.title) ? (
          <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{block.title}</h2>
          </BuilderField>
        ) : null}
        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300">
          {paragraphs.map((p, index) => (
            <BuilderField
              key={`p-${index}`}
              path={`paragraph.${index}`}
              label={`Paragraf ${index + 1}`}
              type="text"
              className="w-fit max-w-full"
            >
              <p>{p}</p>
            </BuilderField>
          ))}
        </div>
      </div>
    </section>
  )
}

function SideCard({ card }: { card: CardGridItem }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {renderIfText(card.title) ? (
        <BuilderField path={`card.${card.id}.title`} label="Kart Başlığı" type="card" className="w-fit max-w-full">
          <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
        </BuilderField>
      ) : null}
      {renderIfText(card.description) ? (
        <BuilderField
          path={`card.${card.id}.description`}
          label="Kart Açıklaması"
          type="card"
          className="w-fit max-w-full"
        >
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
        </BuilderField>
      ) : null}
    </div>
  )
}
