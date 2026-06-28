import type { CSSProperties } from 'react'
import { MediaImage } from '@/media/components/MediaImage'
import { BuilderField } from '@/builder/edit/BuilderField'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { renderIfMediaUrl, renderIfText, shouldShowField } from '@/builder/render/renderRules'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { resolveIcon } from '@/lib/iconRegistry'
import { cn } from '@/lib/cn'
import type { BlockButton, HeroBlock } from '@/builder/types'
import { buildHeroGradientCss } from '@/builder/types'
import { BlockButtonLink } from '@/builder/render/BlockButtonLink'

function heroButtonClass(variant: BlockButton['variant'], outlineClass: string, primaryClass: string) {
  return variant === 'outline' ? outlineClass : primaryClass
}

export function HeroBlockRenderer({ block, mode = 'public' }: BlockRendererProps) {
  if (block.type !== 'hero') return null
  const hero = block as HeroBlock
  if (!hero.visibility.enabled) return null

  const { settings, style, visibility } = hero
  const isPreview = mode === 'preview'

  const height =
    settings.fullscreen ? 'min-h-screen' : 'min-h-[var(--hero-h,280px)]'

  const bgStyle: CSSProperties = {}
  if (settings.mode === 'gradient') {
    bgStyle.background =
      buildHeroGradientCss(settings.gradientStyle, settings.gradient) ??
      settings.gradient ??
      'linear-gradient(135deg, #1e293b, #065f46)'
  } else if (settings.mode === 'solid-color') {
    bgStyle.backgroundColor = style.backgroundColor ?? '#0f172a'
  } else if (style.backgroundColor) {
    bgStyle.backgroundColor = style.backgroundColor
  } else if (style.backgroundGradient) {
    bgStyle.background = style.backgroundGradient
  }

  const desktopUrl =
    settings.mode === 'carousel'
      ? settings.slides.find((s) => s.enabled !== false)?.desktopImage?.url ??
        settings.slides[0]?.desktopImage?.url
      : settings.desktopImage?.url ?? settings.slides[0]?.desktopImage?.url

  const resolvedImage = renderIfMediaUrl(desktopUrl ? resolveMediaUrl(desktopUrl) : null)

  const title = renderIfText(hero.title)
  const description = renderIfText(hero.description)
  const showTitle = shouldShowField(visibility.showTitle, title)
  const showDescription = shouldShowField(visibility.showDescription, description)
  const showImage =
    settings.mode !== 'gradient' &&
    settings.mode !== 'solid-color' &&
    settings.mode !== 'video' &&
    visibility.showImage !== false &&
    Boolean(resolvedImage)

  const visibleButtons = (settings.buttons ?? []).filter(
    (b) => b.visible !== false && renderIfText(b.label) && renderIfText(b.href),
  )
  const showButtons = visibility.showButton !== false && visibleButtons.length > 0

  const hasDarkBackground =
    settings.mode === 'gradient' ||
    settings.mode === 'solid-color' ||
    settings.mode === 'video' ||
    Boolean(style.backgroundGradient) ||
    Boolean(showImage) ||
    style.overlay?.enabled === true ||
    isDarkHexColor(style.backgroundColor)

  const useLightText = hasDarkBackground
  const titleClass = useLightText ? 'text-white drop-shadow' : 'text-slate-900'
  const descClass = useLightText ? 'text-white/90 drop-shadow' : 'text-slate-600'
  const outlineBtnClass = useLightText
    ? 'border border-white text-white'
    : 'border border-slate-300 text-slate-800 hover:bg-slate-50'
  const secondaryBtnClass = useLightText
    ? 'bg-white/10 text-white ring-1 ring-white/30'
    : 'bg-slate-100 text-slate-800 ring-1 ring-slate-200'

  if (
    !showTitle &&
    !showDescription &&
    !showImage &&
    !showButtons &&
    settings.mode !== 'gradient' &&
    settings.mode !== 'solid-color'
  ) {
    if (!isPreview) return null
  }

  if (settings.layout === 'compact') {
    return (
      <section
        className="relative w-full overflow-hidden border-b border-slate-200 bg-slate-900 py-10 sm:py-12"
        style={{
          background:
            style.backgroundGradient ??
            bgStyle.background ??
            'linear-gradient(135deg, #0f172a, #1e293b)',
          ['--hero-h' as string]: settings.height?.desktop ?? '240px',
        }}
      >
        {style.overlay?.enabled ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              backgroundColor: style.overlay.color ?? '#000',
              opacity: style.overlay.opacity ?? 0.35,
            }}
          />
        ) : null}
        <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {visibility.showBadge !== false && settings.badge?.trim() ? (
            <BuilderField path="badge" label="Badge" type="text" className="mb-2 inline-block">
              <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">{settings.badge}</span>
            </BuilderField>
          ) : null}
          {showTitle ? (
            <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
              <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
            </BuilderField>
          ) : null}
          {showDescription ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mt-2 w-fit max-w-2xl">
              <p className="text-sm text-slate-300 md:text-base">{description}</p>
            </BuilderField>
          ) : null}
          {showButtons ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleButtons.map((btn, btnIndex) => (
                <BuilderField
                  key={btn.id}
                  path={`button.${btn.id}`}
                  label={btnIndex === 0 ? 'Buton 1' : 'Buton 2'}
                  type="button"
                  className="inline-block"
                >
                  <BlockButtonLink
                    btn={btn}
                    className={heroButtonClass(
                      btn.variant,
                      'inline-flex rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white',
                      'inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white',
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

  if (settings.layout === 'about') {
    const highlights = (settings.highlights ?? []).filter((h) => renderIfText(h.title))
    const breadcrumbs = settings.showBreadcrumbs !== false ? (settings.breadcrumbs ?? []) : []

    return (
      <section
        className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 py-12 md:py-16 lg:py-20"
        style={{
          background: style.backgroundGradient ?? bgStyle.background,
          paddingTop: style.paddingTop?.desktop,
          paddingBottom: style.paddingBottom?.desktop,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(34,197,94,0.15),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.12),transparent_50%)]" />
        {style.overlay?.enabled ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              backgroundColor: style.overlay.color ?? '#000',
              opacity: style.overlay.opacity ?? 0.4,
            }}
          />
        ) : null}
        <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={cn('grid items-center gap-10 lg:gap-16', showImage ? 'lg:grid-cols-2' : 'max-w-4xl')}>
            <div className="text-white">
              {breadcrumbs.length > 0 ? (
                <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-slate-400">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1">
                      {i > 0 ? <span className="text-slate-600">/</span> : null}
                      {crumb.href ? (
                        <a href={crumb.href} className="hover:text-emerald-400">
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-slate-300">{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              ) : null}
              {visibility.showBadge !== false && settings.badge?.trim() ? (
                <BuilderField path="badge" label="Badge" type="text" className="mb-4 inline-block">
                  <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                    {settings.badge}
                  </span>
                </BuilderField>
              ) : null}
              {showTitle ? (
                <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
                  <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                    {title}
                  </h1>
                </BuilderField>
              ) : null}
              {showDescription ? (
                <BuilderField path="description" label="Açıklama" type="text" className="mt-5 w-fit max-w-xl">
                  <p className="text-base leading-relaxed text-slate-300 md:text-lg">{description}</p>
                </BuilderField>
              ) : null}
              {highlights.length > 0 ? (
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {highlights.map((card) => {
                    const Icon = resolveIcon(card.icon)
                    return (
                      <BuilderField
                        key={card.id}
                        path={`highlight.${card.id}.title`}
                        label="Hero kartı"
                        type="card"
                        className="w-full"
                      >
                        <div
                          className={cn(
                            'rounded-xl border bg-gradient-to-br p-4',
                            card.cardClass ?? 'border-white/10 from-white/5 to-white/0',
                          )}
                        >
                          <Icon className={cn('mb-2 h-5 w-5', card.iconClass ?? 'text-emerald-400')} aria-hidden />
                          <p className="text-sm font-medium leading-snug text-slate-100">{card.title}</p>
                        </div>
                      </BuilderField>
                    )
                  })}
                </div>
              ) : null}
              {showButtons ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {visibleButtons.map((btn, btnIndex) => (
                    <BuilderField
                      key={btn.id}
                      path={`button.${btn.id}`}
                      label={btnIndex === 0 ? 'Buton 1' : 'Buton 2'}
                      type="button"
                      className="inline-block"
                    >
                      <BlockButtonLink
                        btn={btn}
                        className={heroButtonClass(
                          btn.variant,
                          'inline-flex rounded-lg border border-white/30 px-6 py-2.5 text-sm font-medium text-white',
                          'inline-flex rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white',
                        )}
                      />
                    </BuilderField>
                  ))}
                </div>
              ) : null}
            </div>
            {showImage && resolvedImage ? (
              <BuilderField path="image" label="Görsel" type="media" className="relative mx-auto w-full max-w-xl lg:max-w-none">
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-blue-500/15 blur-2xl" />
                <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-900/40 p-2 shadow-2xl">
                  <MediaImage
                    src={resolvedImage}
                    alt={hero.title ?? ''}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                    loading="eager"
                  />
                </div>
              </BuilderField>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  if (settings.layout === 'split') {
    return (
      <section
        className={cn('relative w-full overflow-hidden py-12 sm:py-16 lg:py-20', height)}
        style={{
          background:
            style.backgroundGradient ??
            bgStyle.background ??
            'linear-gradient(to bottom right, #0f172a, #1e293b, #14532d)',
          ['--hero-h' as string]: settings.height?.desktop ?? '520px',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.15),transparent_70%)]" />
        {style.overlay?.enabled ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              backgroundColor: style.overlay.color ?? '#000',
              opacity: style.overlay.opacity ?? 0.4,
            }}
          />
        ) : null}
        <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="text-white">
              {visibility.showBadge !== false && settings.badge?.trim() ? (
                <BuilderField path="badge" label="Badge" type="text" className="mb-4 inline-block">
                  <span className="inline-block rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400">
                    {settings.badge}
                  </span>
                </BuilderField>
              ) : null}
              {showTitle ? (
                <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
                  <h1 className="mb-4 text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">
                    {title}
                  </h1>
                </BuilderField>
              ) : null}
              {showDescription ? (
                <BuilderField path="description" label="Açıklama" type="text" className="w-fit max-w-full">
                  <p className="mb-6 max-w-xl text-base leading-relaxed text-gray-300 md:text-lg">
                    {description}
                  </p>
                </BuilderField>
              ) : null}
              {showButtons ? (
                <div className="flex flex-wrap gap-3">
                  {visibleButtons.map((btn, btnIndex) => (
                    <BuilderField
                      key={btn.id}
                      path={`button.${btn.id}`}
                      label={btnIndex === 0 ? 'Buton 1' : 'Buton 2'}
                      type="button"
                      className="inline-block"
                    >
                      <BlockButtonLink
                        btn={btn}
                        className={heroButtonClass(
                          btn.variant,
                          'inline-flex rounded-lg border border-white/30 px-6 py-2.5 text-sm font-medium text-white',
                          'inline-flex rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white',
                        )}
                      />
                    </BuilderField>
                  ))}
                </div>
              ) : null}
            </div>
            {showImage && resolvedImage ? (
              <BuilderField path="image" label="Görsel" type="media" className="relative">
                <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-xl">
                  <MediaImage
                    src={resolvedImage}
                    alt={hero.title ?? ''}
                    className="aspect-[8/5] w-full object-cover"
                    loading="eager"
                  />
                </div>
              </BuilderField>
            ) : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn('relative w-full overflow-hidden', !hasDarkBackground && 'bg-slate-50', height)}
      style={{
        ...bgStyle,
        ['--hero-h' as string]: settings.height?.desktop ?? '280px',
      }}
    >
      {settings.mode === 'video' && settings.video?.videoUrl ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={settings.video.videoUrl}
          poster={settings.video.posterUrl}
          muted={settings.video.muted}
          loop={settings.video.loop}
          autoPlay={settings.video.autoplay}
          playsInline
        />
      ) : null}

      {style.overlay?.enabled ? (
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            backgroundColor: style.overlay.color ?? '#000',
            opacity: style.overlay.opacity ?? 0.4,
          }}
        />
      ) : null}

      {showImage ? (
        <BuilderField path="image" label="Görsel" type="media" className="absolute inset-0">
          <MediaImage
            src={resolvedImage!}
            alt={hero.title ?? ''}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
        </BuilderField>
      ) : null}

      {(showTitle || showDescription || showButtons) && (
        <div
          className={cn(
            'relative z-[2] mx-auto flex h-full max-w-7xl flex-col justify-center px-4 py-16',
            style.contentAlign === 'center' && 'items-center text-center',
            style.contentAlign === 'right' && 'items-end text-right',
          )}
        >
          {showTitle ? (
            <BuilderField path="title" label="Başlık" type="text" className="w-fit max-w-full">
              <h1 className={cn('text-3xl font-bold md:text-5xl', titleClass)}>{title}</h1>
            </BuilderField>
          ) : null}
          {showDescription ? (
            <BuilderField path="description" label="Açıklama" type="text" className="w-fit max-w-full">
              <p className={cn('mt-4 max-w-2xl text-lg', descClass)}>{description}</p>
            </BuilderField>
          ) : null}
          {showButtons ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {visibleButtons.map((btn, btnIndex) => (
                <BuilderField
                  key={btn.id}
                  path={`button.${btn.id}`}
                  label={btnIndex === 0 ? 'Buton 1' : btnIndex === 1 ? 'Buton 2' : 'Buton'}
                  type="button"
                  className="inline-block"
                >
                  <BlockButtonLink
                    btn={btn}
                    className={cn(
                      'inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold transition',
                      btn.variant === 'secondary' && secondaryBtnClass,
                      btn.variant === 'outline' && outlineBtnClass,
                      (!btn.variant || btn.variant === 'primary') &&
                        'bg-emerald-600 text-white hover:bg-emerald-700',
                    )}
                  />
                </BuilderField>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}

function isDarkHexColor(color?: string | null): boolean {
  if (!color) return false
  const hex = color.trim()
  const match = hex.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (!match) return false
  const raw = match[1]
  const expanded = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw
  const r = parseInt(expanded.slice(0, 2), 16)
  const g = parseInt(expanded.slice(2, 4), 16)
  const b = parseInt(expanded.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance < 0.45
}
