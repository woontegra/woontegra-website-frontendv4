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
import { HeroSlideLinkShell } from '@/builder/render/HeroSlideLinkShell'
import {
  carouselHasDistinctMobileImage,
  getHeroSlideImageSources,
  getSlideLink,
  slideHasRenderableImage,
  slideUsesMobileNaturalLayout,
} from '@/builder/render/heroResponsiveImage'
import { renderIfText, shouldShowField } from '@/builder/render/renderRules'
import type { BlockButton, HeroBlock, HeroSlide } from '@/builder/types'
import { HeroResponsiveImage } from '@/media/components/HeroResponsiveImage'
import { cn } from '@/lib/cn'

type Props = {
  hero: HeroBlock
  mode?: 'public' | 'preview'
}

function useNarrowViewport(maxWidth: number): boolean {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${maxWidth}px)`).matches : false,
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`)
    const onChange = () => setNarrow(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [maxWidth])

  return narrow
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

function heroCenteredImageClass(naturalMobile: boolean): string {
  if (naturalMobile) {
    return cn(
      'relative block w-full max-w-full max-[640px]:h-auto max-[640px]:object-contain max-[640px]:object-center',
      'sm:absolute sm:inset-0 sm:h-full sm:w-full sm:object-cover sm:object-center',
    )
  }
  return 'absolute inset-0 h-full w-full object-cover object-center'
}

function heroSplitImageClass(naturalMobile: boolean): string {
  if (naturalMobile) {
    return cn(
      'w-full max-[640px]:h-auto max-[640px]:max-h-[85vh] max-[640px]:object-contain max-[640px]:object-top',
      'sm:aspect-[8/5] sm:max-h-none sm:object-cover sm:object-center',
    )
  }
  return 'aspect-[8/5] w-full object-cover object-center'
}

export function HeroCarouselSection({ hero }: Props) {
  const { settings, style, visibility } = hero
  const sectionRef = useRef<HTMLElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const isMobileViewport = useNarrowViewport(640)
  const prefersReducedMotion = usePrefersReducedMotion()
  const layout = settings.layout ?? 'centered'
  const isSplit = layout === 'split'

  const slides = useMemo(() => sortedEnabledSlides(settings.slides), [settings.slides])
  const isCarousel = slides.length > 1
  const hasAnyImage = slides.some((s) => slideHasRenderableImage(s))

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

  const carouselMobileNatural = carouselHasDistinctMobileImage(settings)
  const currentSlideNaturalMobile = currentSlide
    ? slideUsesMobileNaturalLayout(currentSlide, settings)
    : false
  const useMobileFlowLayout = !isSplit && isMobileViewport && carouselMobileNatural

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

  // Centered (banner) carousel artık görselin doğal oranını korur; yükseklik
  // genişliğe göre otomatik oluşur (sabit px yok → kırpma yok). Split hero eski
  // davranışını korur.
  const sectionHeightClass = isSplit
    ? carouselMobileNatural
      ? 'max-[640px]:min-h-[200px] sm:py-12 sm:min-h-[var(--hero-h-mobile,var(--hero-h,520px))] lg:py-20'
      : 'py-12 sm:py-16 lg:py-20 min-h-[var(--hero-h-mobile,var(--hero-h,520px))] lg:min-h-[var(--hero-h,520px)]'
    : ''

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

    if (!showTitle && !showDescription && !showBadge && !showButtons) return null

    const contentAlign = settings.contentAlign ?? style.contentAlign ?? 'left'
    const alignClass =
      contentAlign === 'center'
        ? 'items-center text-center'
        : contentAlign === 'right'
          ? 'items-end text-right'
          : 'items-start text-left'

    return (
      <div
        key={`content-${slide.id}`}
        className={cn(
          transitionClass,
          'pointer-events-none',
          isCarousel && !active && 'absolute inset-0 opacity-0',
          isCarousel && active && !useMobileFlowLayout && 'absolute inset-0 z-[3] opacity-100',
          isCarousel && active && useMobileFlowLayout && 'relative z-[2] opacity-100',
          !isCarousel && 'relative z-[2]',
        )}
        aria-hidden={isCarousel && !active}
      >
        <div
          className={cn(
            'mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-4 py-8 text-white sm:py-16',
            hideContentOnMobile && 'max-[640px]:hidden',
            alignClass,
          )}
        >
          {showBadge ? (
            <BuilderField
              path={`slides.${slideIndex}.badge`}
              label="Badge"
              type="text"
              className="pointer-events-auto mb-4 inline-block"
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
              className="pointer-events-auto w-fit max-w-full"
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
              className="pointer-events-auto w-fit max-w-full"
            >
              <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-300 drop-shadow md:text-lg">
                {description}
              </p>
            </BuilderField>
          ) : null}
          {showButtons ? (
            <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
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
    const link = getSlideLink(slide)
    const slideNaturalMobile = slideUsesMobileNaturalLayout(slide, settings)

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
          className={
            isSplit
              ? heroSplitImageClass(slideNaturalMobile)
              : heroCenteredImageClass(slideNaturalMobile)
          }
          loading="eager"
          fetchPriority={slideIndex === 0 ? 'high' : 'auto'}
          fill={!isSplit && !slideNaturalMobile && !useMobileFlowLayout}
        />
      </>
    )

    const wrapperClass = isSplit
      ? cn(
          'relative overflow-hidden rounded-xl border border-white/10 shadow-xl',
          slideNaturalMobile && 'max-[640px]:rounded-none max-[640px]:border-0 max-[640px]:shadow-none',
        )
      : useMobileFlowLayout
        ? 'relative w-full overflow-hidden bg-slate-900'
        : slideNaturalMobile
          ? 'relative w-full max-[640px]:bg-slate-900 sm:absolute sm:inset-0'
          : 'absolute inset-0'

    const inner = (
      <div
        className={cn(
          wrapperClass,
          isCarousel && !isSplit && !useMobileFlowLayout && 'absolute inset-0',
          isCarousel && !active && !useMobileFlowLayout && 'pointer-events-none opacity-0',
          isCarousel && active && !useMobileFlowLayout && 'opacity-100',
          isCarousel && !active && useMobileFlowLayout && 'hidden',
          transitionClass,
        )}
        aria-hidden={isCarousel && !active}
      >
        {imageNode}
      </div>
    )

    const linkClass = cn(
      'block h-full w-full',
      !isSplit && !useMobileFlowLayout && 'absolute inset-0',
      useMobileFlowLayout && 'relative w-full',
    )

    return (
      <BuilderField
        key={slide.id}
        path={`slides.${slideIndex}.image`}
        label="Görsel"
        type="media"
        className={cn(
          isCarousel && !isSplit && !useMobileFlowLayout && 'absolute inset-0',
          useMobileFlowLayout && active && 'relative w-full',
          !isCarousel && 'relative',
          isCarousel && !isSplit && !useMobileFlowLayout && !active && 'pointer-events-none opacity-0',
          isCarousel && !isSplit && !useMobileFlowLayout && active && 'opacity-100',
          transitionClass,
        )}
      >
        <HeroSlideLinkShell
          href={link}
          className={linkClass}
          ariaLabel={imageAlt ? `${imageAlt} — slayt bağlantısı` : 'Slayt bağlantısı'}
        >
          {inner}
        </HeroSlideLinkShell>
      </BuilderField>
    )
  }

  if (slides.length === 0 || !hasAnyImage) return null

  const controlsVisible = isCarousel && (showArrows || showDots)

  return (
    <section
      ref={sectionRef}
      className={cn('relative w-full overflow-hidden bg-slate-900', sectionHeightClass)}
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
          {/* Banner görselleri aynı grid hücresinde üst üste (crossfade); her biri
              doğal oranıyla (object-contain, h-auto) → hiçbir ekranda kırpılmaz. */}
          <div className="relative grid w-full">
            {(() => {
              const slide = slides[safeIndex]
              if (!slide) return null
              const sources = getHeroSlideImageSources(slide)
              if (!sources) return null
              const overlay = slideOverlay(slide, hero)
              const imageAlt = getSlideText(slide, hero, 'title') ?? hero.title ?? ''
              const link = getSlideLink(slide)
              return (
                <div key={slide.id} className="[grid-area:1/1] w-full">
                  <BuilderField
                    path={`slides.${safeIndex}.image`}
                    label="Görsel"
                    type="media"
                    className="block w-full"
                  >
                    <HeroSlideLinkShell
                      href={link}
                      className="block w-full"
                      ariaLabel={imageAlt ? `${imageAlt} — slayt bağlantısı` : 'Slayt bağlantısı'}
                    >
                      <div className="relative w-full">
                        <HeroResponsiveImage
                          sources={sources}
                          alt={imageAlt}
                          className="block h-auto w-full object-contain object-center"
                          loading="eager"
                          fetchPriority={safeIndex === 0 ? 'high' : 'auto'}
                        />
                        {overlay ? (
                          <div
                            className="pointer-events-none absolute inset-0 z-[1]"
                            style={{
                              backgroundColor: overlay.color ?? '#000',
                              opacity: overlay.opacity ?? 0.4,
                            }}
                          />
                        ) : null}
                      </div>
                    </HeroSlideLinkShell>
                  </BuilderField>
                </div>
              )
            })()}
            {!slideOverlay(currentSlide, hero) && style.overlay?.enabled ? (
              <div
                className="pointer-events-none absolute inset-0 z-[1]"
                style={{
                  backgroundColor: style.overlay.color ?? '#000',
                  opacity: style.overlay.opacity ?? 0.4,
                }}
              />
            ) : null}
          </div>

          {/* Metin/buton içeriği görselin üzerine bindirilir (banner içine gömülü
              yazı varsa bu alan boş kalır). */}
          <div className="pointer-events-none absolute inset-0 z-[2]">
            {slides.map((slide, i) => renderSlideContent(slide, i, i === safeIndex))}
          </div>
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
              <div className={cn('relative min-h-[120px]', hideContentOnMobile && 'max-[640px]:hidden')}>
                {slides.map((slide, i) => renderSlideContent(slide, i, i === safeIndex))}
              </div>
              <div
                className={cn(
                  'relative w-full',
                  currentSlideNaturalMobile ? 'max-[640px]:min-h-[200px]' : 'min-h-[240px]',
                  hideContentOnMobile && 'max-[640px]:order-first',
                )}
              >
                {slides[safeIndex] ? renderSlideImage(slides[safeIndex], safeIndex, true) : null}
              </div>
            </div>
          </div>
        </>
      )}

      {controlsVisible ? (
        <>
          {showArrows ? (
            <>
              <button
                type="button"
                aria-label="Önceki slayt"
                className="pointer-events-auto absolute left-3 top-1/2 z-[5] -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:left-4"
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
                className="pointer-events-auto absolute right-3 top-1/2 z-[5] -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:right-4"
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
              className="pointer-events-auto absolute bottom-4 left-1/2 z-[5] flex -translate-x-1/2 gap-2"
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
                    i === safeIndex ? 'scale-110 bg-white' : 'bg-white/45 hover:bg-white/70',
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
