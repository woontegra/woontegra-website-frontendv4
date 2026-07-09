import type { CSSProperties } from 'react'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { BlockSectionHeader } from '@/builder/render/SectionBlockShell'
import { BlockButtonLink } from '@/builder/render/BlockButtonLink'
import { renderIfText } from '@/builder/render/renderRules'
import { resolvePublicImage } from '@/media/resolvePublicImage'
import { cn } from '@/lib/cn'
import type { CtaBlock } from '@/builder/types'

export function CtaBlockRenderer({ block }: BlockRendererProps) {
  if (block.type !== 'cta') return null
  const b = block as CtaBlock
  if (!b.visibility.enabled) return null

  const buttons = (b.settings.buttons ?? []).filter(
    (btn) => btn.visible !== false && renderIfText(btn.label) && renderIfText(btn.href),
  )
  const showButtons = b.visibility.showButton !== false && buttons.length > 0
  const hasHeader =
    (b.visibility.showTitle !== false && renderIfText(b.title)) ||
    (b.visibility.showDescription !== false && renderIfText(b.description))

  if (!hasHeader && !showButtons) return null

  const bgStyle: CSSProperties = {}
  if (b.settings.backgroundType === 'gradient' && b.settings.gradient) {
    bgStyle.background = b.settings.gradient
  } else if (b.settings.backgroundType === 'image') {
    const bgImage = resolvePublicImage(b.settings)
    if (bgImage) {
      bgStyle.backgroundImage = `url(${bgImage})`
      bgStyle.backgroundSize = 'cover'
      bgStyle.backgroundPosition = 'center'
    }
  } else if (b.style.backgroundColor) {
    bgStyle.backgroundColor = b.style.backgroundColor
  }

  const darkBg =
    b.settings.backgroundType === 'gradient' ||
    b.settings.backgroundType === 'image' ||
    Boolean(b.style.backgroundColor)

  const isAbout = b.settings.variant === 'about'

  if (isAbout) {
    return (
      <section
        className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 py-20 md:py-24"
        style={{
          background: b.settings.gradient ?? bgStyle.background,
          paddingTop: b.style.paddingTop?.desktop,
          paddingBottom: b.style.paddingBottom?.desktop,
        }}
      >
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          {b.visibility.showTitle !== false && renderIfText(b.title) ? (
            <BuilderField path="title" label="Başlık" type="text" className="mx-auto w-fit">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{b.title}</h2>
            </BuilderField>
          ) : null}
          {b.visibility.showDescription !== false && renderIfText(b.description) ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mx-auto mt-5 w-fit max-w-2xl">
              <p className="text-base leading-relaxed text-emerald-50 md:text-lg">{b.description}</p>
            </BuilderField>
          ) : null}
          {showButtons ? (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {buttons.map((btn, btnIndex) => (
                <BuilderField
                  key={btn.id}
                  path={`button.${btn.id}`}
                  label={btnIndex === 0 ? 'Primary Button' : 'Secondary Button'}
                  type="button"
                  className="inline-block"
                >
                  <BlockButtonLink
                    btn={btn}
                    className="inline-flex items-center justify-center rounded-lg border border-white/40 px-10 py-4 text-base text-white transition hover:bg-white hover:text-emerald-700"
                  />
                </BuilderField>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    )
  }

  return (
    <section
      className="w-full py-12"
      style={{
        ...bgStyle,
        paddingTop: b.style.paddingTop?.desktop,
        paddingBottom: b.style.paddingBottom?.desktop,
      }}
    >
      <div className="mx-auto max-w-7xl px-4 text-center">
        <BlockSectionHeader
          title={b.title}
          description={b.description}
          showTitle={b.visibility.showTitle}
          showDescription={b.visibility.showDescription}
        />
        {showButtons ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {buttons.map((btn, btnIndex) => (
              <BuilderField
                key={btn.id}
                path={`button.${btn.id}`}
                label={btnIndex === 0 ? 'Primary Button' : 'Secondary Button'}
                type="button"
                className="inline-block"
              >
                <BlockButtonLink
                  btn={btn}
                  className={cn(
                    'inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold transition',
                    btn.variant === 'outline' &&
                      (darkBg
                        ? 'border border-white text-white'
                        : 'border border-slate-300 text-slate-800'),
                    btn.variant === 'secondary' &&
                      (darkBg ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'),
                    (!btn.variant || btn.variant === 'primary') &&
                      'bg-emerald-600 text-white hover:bg-emerald-700',
                  )}
                />
              </BuilderField>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
