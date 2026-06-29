import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BuilderField } from '@/builder/edit/BuilderField'
import { BlockButtonLink } from '@/builder/render/BlockButtonLink'
import {
  getHeroSlideImageSources,
  heroUsesMobileNaturalImageLayout,
} from '@/builder/render/heroResponsiveImage'
import { renderIfText, shouldShowField } from '@/builder/render/renderRules'
import type { BlockButton, HeroBlock, HeroSlide } from '@/builder/types'
import { HeroResponsiveImage } from '@/media/components/HeroResponsiveImage'
import { cn } from '@/lib/cn'

type Props = {
  hero: HeroBlock
  mode?: 'public' | 'preview' | 'edit'
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function heroHeightVars(settings: HeroBlock['settings'], desktopDefault: string): CSSProperties {
  return {
    ['--hero-h' as string]: settings.height?.desktop ?? desktopDefault,
    ['--hero-h-mobile' as string]:
      settings.height?.mobile ?? settings.height?.tablet ?? desktopDefault,
  }
}

function heroMinHeightClass(settings: HeroBlock['settings'], fullscreen?: boolean): string {
  if (fullscreen) return 'min-h-screen'
  if (heroUsesMobileNaturalImageLayout(settings)) {
    return 'max-[640px]:min-h-0 sm:min-h-[var(--hero-h-mobile,var(--hero-h,280px))] lg:min-h-[var(--hero-h,280px)]'
  }
  return 'min-h-[var(--hero-h-mobile,var(--hero-h,280px))] lg:min-h-[var(--hero-h,280px)]'
}

function heroCenteredImageClass(naturalMobile: boolean): string {
  if (naturalMobile) {
    return cn(
      'relative block w-full max-w-full max-[640px]:h-auto max-[640px]:object-contain max-[640px]:object-center',
      'sm:absolute sm:inset-0 sm:h-full sm:w-full sm:object-cover sm:object-center',
    )
  }
  return 'absolute inset-0 h-full w-full object-cover object-center'
}

function heroCenteredImageWrapperClass(naturalMobile: boolean): string {
  if (naturalMobile) return 'relative w-full max-[640px]:bg-slate-900 sm:absolute sm:inset-0'
  return 'absolute inset-0'
}

function heroSplitImageClass(naturalMobile: boolean): string {
  if (naturalMobile) {
    return cn(
      'w-full max-[640px]:h-auto max-[640px]:object-contain max-[640px]:object-top',
      'sm:aspect-[8/5] sm:object-cover sm:object-center',
    )
  }
  return 'aspect-[8/5] w-full object-cover object-center'
}

function heroButtonClass(variant: BlockButton['variant'], outlineClass: string, primaryClass: string) {
  return variant === 'outline' ? outlineClass : primaryClass
}

function sortedEnabledSlides(slides: HeroSlide[]): HeroSlide[] {
  return [...slides].filter((s) => s.enabled !== false).sort((a, b) => a.sortOrder - b.sortOrder)
}

function getSlideText(
  slide: HeroSlide,
  block: HeroBlock,
  field: 'title' | 'description' | 'badge',
): string | null {
  const slideVal = renderIfText(slide[field])
  if (slideVal) return slideVal
  if (field === 'badge') return renderIfText(block.settings.badge)
  return renderIfText(block[field])
}

function getSlideButtons(slide: HeroSlide, block: HeroBlock): BlockButton[] {
  const slideButtons = (slide.buttons ?? []).filter(
    (b) => b.visible !== false && renderIfText(b.label) && renderIfText(b.href),
  )
  if (slideButtons.length > 0) return slideButtons
  return (block.settings.buttons ?? []).filter(
    (b) => b.visible !== false && renderIfText(b.label) && renderIfText(b.href),
  )
}

function slideOverlay(slide: HeroSlide, block: HeroBlock) {
  if (slide.overlay?.enabled) return slide.overlay
  if (block.style.overlay?.enabled) return block.style.overlay
  return null
}

function stopBuilderNav(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
}

export function HeroCarouselSection({ hero, mode = 'public' }: Props) {
  const { settings, style, visibility } = hero
  const sectionRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const prefersReducedMotion = usePrefersReducedMotion()
  const layout = settings.layout ?? 'centered'
  const isSplit = layout === 'split'

  const slides = useMemo(() => sortedEnabledSlides(settings.slides), [settings.slides])
  const isCarousel = slides.length > 1

  const carousel = settings.carousel ?? {}
  const autoplay = carousel.autoplay ?? true
  const intervalMs = carousel.intervalMs ?? 5000
  const showArrows = carousel.showArrows ?? true
  const showDots = carousel.showDots ?? true
  const pauseOnHover = carousel.pauseOnHover ?? true
  const loop = carousel.loop ?? true

  const effectiveAutoplay = autoplay && !prefersReducedMotion && isCarousel

  const safeIndex = slides.length > 0 ? currentIndex % slides.length : 0
  const currentSlide = slides[safeIndex]

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return
      setCurrentIndex(((index % slides.length) + slides.length) % slides.length)
    },
    [slides.length],
  )

  const goNext = useCallback(() => {
    if (slides.length <= 1) return
    setCurrentIndex((prev) => {
      const next = prev + 1
      if (next >= slides.length) return loop ? 0 : prev
      return next
    })
  }, [slides.length, loop])

  const goPrev = useCallback(() => {
    if (slides.length <= 1) return
    setCurrentIndex((prev) => {
      const next = prev - 1
      if (next < 0) return loop ? slides.length - 1 : prev
      return next
    })
  }, [slides.length, loop])

  useEffect(() => {
    setCurrentIndex((prev) => (slides.length === 0 ? 0 : Math.min(prev, slides.length - 1)))
  }, [slides.length])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? true),
      { threshold: 0.2 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!effectiveAutoplay || !isVisible || isPaused) return
    const id = window.setInterval(goNext, intervalMs)
    return () => window.clearInterval(id)
  }, [effectiveAutoplay, isVisible, isPaused, intervalMs, goNext, safeIndex])

  const height = heroMinHeightClass(settings, settings.fullscreen)
  const naturalMobileImage = heroUsesMobileNaturalImageLayout(settings)
  const hideContentOnMobile =
    settings.hideContentOnMobile === true ||
    hero.responsiveSettings?.hideContentOnMobile === true ||
    hero.responsiveSettings?.hideMobileContent === true

  const bgStyle: CSSProperties = {}
  if (style.backgroundColor) bgStyle.backgroundColor = style.backgroundColor
  if (style.backgroundGradient) bgStyle.background = style.backgroundGradient

  const transitionClass = prefersReducedMotion
    ? 'transition-none'
    : 'transition-opacity duration-700 ease-in-out'

  const renderSlideContent = (slide: HeroSlide, slideIndex: number, active: boolean) => {
    const title = getSlideText(slide, hero, 'title')
    const description = getSlideText(slide, hero, 'description')
    const badge = getSlideText(slide, hero, 'badge')
    const slideVisibility = { ...visibility, ...slide.visibility }

    const showTitle = shouldShowField(slideVisibility.showTitle, title)
    const showDescription = shouldShowField(slideVisibility.showDescription, description)
    const showBadge = slideVisibility.showBadge !== false && Boolean(badge)
    const visibleButtons = getSlideButtons(slide, hero)
    const showButtons = slideVisibility.showButton !== false && visibleButtons.length > 0

    const contentAlign = settings.contentAlign ?? style.contentAlign ?? 'left'
    const alignClass =
      contentAlign === 'center'
        ? 'items-center text-center'
        : contentAlign === 'right'
          ? 'items-end text-right'
          : 'items-start text-left'

    return (
      <div
        key={slide.id}
        className={cn(
          transitionClass,
          isCarousel && !active && 'pointer-events-none absolute inset-0 opacity-0',
          isCarousel && active && 'absolute inset-0 z-[2] opacity-100',
          !isCarousel && 'relative z-[2]',
        )}
        aria-hidden={isCarousel && !active}
      >
        <div
          className={cn(
            'mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 py-16 text-white',
            hideContentOnMobile && 'max-[640px]:hidden',
            alignClass,
          )}
        >
          {showBadge ? (
            <BuilderField
              path={`slides.${slideIndex}.badge`}
              label="Badge"
              type="text"
              className="mb-4 inline-block"
            >
              <span className="inline-block rounded-full bg-green-500/20 px-3 py-1.5 text-xs font-medium text-green-400">
                {badge}
              </span>
            </BuilderField>
          ) : null}
          {showTitle ? (
            <BuilderField
              path={`slides.${slideIndex}.title`}
              label="Başlık"
              type="text"
              className="w-fit max-w-full"
            >
              <h1 className="text-3xl font-semibold leading-tight text-white drop-shadow md:text-4xl lg:text-5xl">
                {title}
              </h1>
            </BuilderField>
          ) : null}
          {showDescription ? (
            <BuilderField
              path={`slides.${slideIndex}.description`}
              label="Açıklama"
              type="text"
              className="w-fit max-w-full"
            >
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-300 drop-shadow md:text-lg">
                {description}
              </p>
            </BuilderField>
          ) : null}
          {showButtons ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {visibleButtons.map((btn, btnIndex) => (
                <BuilderField
                  key={btn.id}
                  path={`slides.${slideIndex}.button.${btn.id}`}
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
      </div>
    )
  }

  const renderSlideImage = (slide: HeroSlide, slideIndex: number, active: boolean) => {
    const sources = getHeroSlideImageSources(slide)
    if (!sources) return null

    const overlay = slideOverlay(slide, hero)
    const imageAlt = getSlideText(slide, hero, 'title') ?? hero.title ?? ''
    const link = slide.link?.trim()

    const imageNode = (
      <>
        {overlay ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1]"
            style={{
              backgroundColor: overlay.color ?? '#000',
              opacity: overlay.opacity ?? 0.4,
            }}
          />
        ) : null}
        <HeroResponsiveImage
          sources={sources}
          alt={imageAlt}
          className={isSplit ? heroSplitImageClass(naturalMobileImage) : heroCenteredImageClass(naturalMobileImage)}
          loading={slideIndex === 0 ? 'eager' : 'lazy'}
          fill={!isSplit && !naturalMobileImage}
        />
      </>
    )

    const wrapperClass = isSplit
      ? cn(
          'relative overflow-hidden rounded-xl border border-white/10 shadow-xl',
          naturalMobileImage && 'max-[640px]:rounded-none max-[640px]:border-0 max-[640px]:shadow-none',
        )
      : heroCenteredImageWrapperClass(naturalMobileImage)

    const inner = (
      <div
        className={cn(
          wrapperClass,
          isCarousel && !isSplit && 'absolute inset-0',
          isCarousel && !active && !isSplit && 'pointer-events-none opacity-0',
          isCarousel && active && !isSplit && 'opacity-100',
          transitionClass,
        )}
        aria-hidden={isCarousel && !active}
      >
        {imageNode}
      </div>
    )

    if (link && mode === 'public') {
      const isExternal = /^https?:\/\//i.test(link)
      return (
        <BuilderField
          key={slide.id}
          path={`slides.${slideIndex}.image`}
          label="Görsel"
          type="media"
          className={cn(isCarousel && !isSplit && 'absolute inset-0', !isCarousel && 'relative')}
        >
          <a
            href={link}
            className={cn('block h-full w-full', isCarousel && !isSplit && 'absolute inset-0')}
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {inner}
          </a>
        </BuilderField>
      )
    }

    return (
      <BuilderField
        key={slide.id}
        path={`slides.${slideIndex}.image`}
        label="Görsel"
        type="media"
        className={cn(
          isCarousel && !isSplit ? 'absolute inset-0' : 'relative',
          isCarousel && !isSplit && !active && 'pointer-events-none opacity-0',
          isCarousel && !isSplit && active && 'opacity-100',
          transitionClass,
        )}
      >
        {inner}
      </BuilderField>
    )
  }

  if (slides.length === 0) return null

  const controlsVisible = isCarousel && (showArrows || showDots)

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative w-full overflow-hidden bg-slate-900',
        naturalMobileImage && 'max-[640px]:bg-slate-900',
        isSplit
          ? cn(
              naturalMobileImage
                ? 'max-[640px]:min-h-0 max-[640px]:bg-slate-900 sm:py-12 sm:min-h-[var(--hero-h-mobile,var(--hero-h,520px))] lg:py-20'
                : cn('py-12 sm:py-16 lg:py-20', height),
            )
          : cn('relative', height),
      )}
      style={{
        ...bgStyle,
        ...heroHeightVars(settings, isSplit ? '520px' : '280px'),
        ...(style.paddingTop?.desktop && isSplit ? { paddingTop: style.paddingTop.desktop } : {}),
        ...(style.paddingBottom?.desktop && isSplit ? { paddingBottom: style.paddingBottom.desktop } : {}),
      }}
      onMouseEnter={pauseOnHover && effectiveAutoplay ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover && effectiveAutoplay ? () => setIsPaused(false) : undefined}
    >
      {!isSplit ? (
        <>
          <div className="absolute inset-0">
            {slides.map((slide, i) => renderSlideImage(slide, i, i === safeIndex))}
          </div>
          {!slideOverlay(currentSlide, hero) && style.overlay?.enabled ? (
            <div
              className="pointer-events-none absolute inset-0 z-[1]"
              style={{
                backgroundColor: style.overlay.color ?? '#000',
                opacity: style.overlay.opacity ?? 0.4,
              }}
            />
          ) : null}
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.15),transparent_70%)]" />
          <div className="relative z-[2] mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                'grid items-center gap-10 lg:grid-cols-2 lg:gap-12',
                hideContentOnMobile && 'max-[640px]:grid-cols-1',
              )}
            >
              <div className={cn('relative min-h-[200px]', hideContentOnMobile && 'max-[640px]:hidden')}>
                {slides.map((slide, i) => renderSlideContent(slide, i, i === safeIndex))}
              </div>
              <div
                className={cn(
                  'relative min-h-[240px]',
                  hideContentOnMobile && 'max-[640px]:order-first',
                )}
              >
                {slides.map((slide, i) => (
                  <div
                    key={slide.id}
                    className={cn(
                      transitionClass,
                      isCarousel && i !== safeIndex && 'pointer-events-none absolute inset-0 opacity-0',
                      isCarousel && i === safeIndex && 'relative opacity-100',
                      !isCarousel && 'relative',
                    )}
                  >
                    {renderSlideImage(slide, i, i === safeIndex)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {!isSplit ? (
        <div className="relative z-[2] h-full min-h-[inherit]">
          {slides.map((slide, i) => renderSlideContent(slide, i, i === safeIndex))}
        </div>
      ) : null}

      {controlsVisible ? (
        <>
          {showArrows ? (
            <>
              <button
                type="button"
                aria-label="Önceki slayt"
                className="absolute left-3 top-1/2 z-[4] -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-4"
                onClick={(e) => {
                  stopBuilderNav(e)
                  goPrev()
                }}
              >
                <ChevronLeft className="h-6 w-6" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Sonraki slayt"
                className="absolute right-3 top-1/2 z-[4] -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-4"
                onClick={(e) => {
                  stopBuilderNav(e)
                  goNext()
                }}
              >
                <ChevronRight className="h-6 w-6" aria-hidden />
              </button>
            </>
          ) : null}
          {showDots ? (
            <div
              className="absolute bottom-4 left-1/2 z-[4] flex -translate-x-1/2 gap-2"
              role="tablist"
              aria-label="Slayt seçimi"
            >
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={i === safeIndex}
                  aria-label={`Slayt ${i + 1}`}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70',
                    i === safeIndex ? 'bg-white scale-110' : 'bg-white/45 hover:bg-white/70',
                  )}
                  onClick={(e) => {
                    stopBuilderNav(e)
                    goTo(i)
                  }}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
