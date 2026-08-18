import type { CSSProperties } from 'react'
import { Check } from 'lucide-react'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { BuilderField } from '@/builder/edit/BuilderField'
import { BlockSectionHeader } from '@/builder/render/SectionBlockShell'
import { BlockButtonLink } from '@/builder/render/BlockButtonLink'
import { isMkSaasProblemBand, MK_SAAS_PROBLEM_PILLS } from '@/builder/render/mkSaasBuilderVisuals'
import { renderIfText } from '@/builder/render/renderRules'
import { resolvePublicImage } from '@/media/resolvePublicImage'
import { cn } from '@/lib/cn'
import { isRemovedServicePublicLink } from '@/lib/serviceSlugs'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import type { CtaBlock } from '@/builder/types'

export function CtaBlockRenderer({ block, mode = 'public' }: BlockRendererProps) {
  const { annotateFields } = useBuilderEditContext()
  if (block.type !== 'cta') return null
  const b = block as CtaBlock
  if (!b.visibility.enabled) return null

  const buttons = (b.settings.buttons ?? []).filter(
    (btn) =>
      btn.visible !== false &&
      renderIfText(btn.label) &&
      renderIfText(btn.href) &&
      (annotateFields || mode !== 'public' || !isRemovedServicePublicLink(btn.href, btn.label)),
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
  const isMkProblemBand = isMkSaasProblemBand(b)
  const isMkCompareEditions = b.settings.variant === 'mk-compare-editions'

  if (isMkProblemBand) {
    const pills =
      (b.settings.featurePills ?? []).filter((item) => item.trim().length > 0).length > 0
        ? (b.settings.featurePills ?? []).filter((item) => item.trim().length > 0)
        : [...MK_SAAS_PROBLEM_PILLS]

    return (
      <section
        className="relative z-0 border-y border-slate-200 bg-white py-10 sm:py-12"
        style={{
          paddingTop: b.style.paddingTop?.desktop,
          paddingBottom: b.style.paddingBottom?.desktop,
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:flex-row lg:justify-between lg:gap-12 xl:px-8">
          {b.visibility.showTitle !== false && renderIfText(b.title) ? (
            <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-xl">
              <p className="text-center text-lg font-semibold text-slate-800 lg:text-left lg:text-xl">{b.title}</p>
            </BuilderField>
          ) : null}
          <ul className="grid w-full max-w-lg gap-3 sm:grid-cols-3 lg:max-w-none lg:flex lg:w-auto lg:gap-8">
            {pills.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-900"
              >
                <Check className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    )
  }

  if (isMkCompareEditions) {
    const pills = (b.settings.featurePills ?? []).filter((item) => item.trim().length > 0)
    const footerLabel = b.settings.footerLinkLabel?.trim()
    const footerHref = b.settings.footerLinkHref?.trim() || '#urun-secimi'
    return (
      <section
        className="border-t border-slate-800 bg-gradient-to-br from-slate-950 via-[#10263f] to-slate-900 py-16 text-white sm:py-20"
        style={{
          background: b.settings.gradient,
          paddingTop: b.style.paddingTop?.desktop,
          paddingBottom: b.style.paddingBottom?.desktop,
        }}
      >
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6">
          {b.visibility.showTitle !== false && renderIfText(b.title) ? (
            <BuilderField path="title" label="Başlık" type="text" className="mx-auto block w-fit">
              <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">{b.title}</h2>
            </BuilderField>
          ) : null}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {buttons.map((btn, index) => (
              <BuilderField
                key={btn.id}
                path={`button.${btn.id}`}
                label={index === 0 ? 'Masaüstü CTA' : 'SaaS CTA'}
                type="button"
              >
                <a
                  href={btn.href || '#urun-secimi'}
                  onClick={(e) => {
                    const raw = (btn.href || '#urun-secimi').trim()
                    if (!raw.startsWith('#')) return
                    const el = document.getElementById(raw.slice(1))
                    if (el) {
                      e.preventDefault()
                      el.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                  className={
                    index === 0
                      ? 'block rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-6 py-6 text-left transition hover:bg-emerald-500/15'
                      : 'block rounded-2xl border border-sky-400/25 bg-sky-500/10 px-6 py-6 text-left transition hover:bg-sky-500/15'
                  }
                >
                  <p className="text-lg font-bold text-white">{btn.label}</p>
                  <p className={`mt-2 text-sm ${index === 0 ? 'text-emerald-100/80' : 'text-sky-100/80'}`}>
                    {pills[index] ?? ''}
                  </p>
                </a>
              </BuilderField>
            ))}
          </div>
          {footerLabel ? (
            <p className="mt-8 text-center">
              <a
                href={footerHref}
                className="text-sm font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline"
                onClick={(e) => {
                  const id = footerHref.startsWith('#') ? footerHref.slice(1) : ''
                  if (!id) return
                  const el = document.getElementById(id)
                  if (el) {
                    e.preventDefault()
                    el.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              >
                {footerLabel}
              </a>
            </p>
          ) : null}
        </div>
      </section>
    )
  }

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
