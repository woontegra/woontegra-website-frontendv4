import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { AlertTriangle, ChevronRight, ExternalLink, Smartphone, X } from 'lucide-react'
import { BuilderField } from '@/builder/edit/BuilderField'
import type { BlockRendererProps } from '@/builder/registry/renderRegistry'
import { renderIfText } from '@/builder/render/renderRules'
import type { WhatsAppGuideBlock, WhatsAppGuideStep } from '@/builder/types'
import { whatsAppGuideStepHasImage } from '@/builder/types'
import { MediaImage } from '@/media/components/MediaImage'
import { cn } from '@/lib/cn'

type Platform = 'android' | 'iphone'

function sortedVisibleSteps(steps: WhatsAppGuideStep[], publicMode: boolean): WhatsAppGuideStep[] {
  return [...steps]
    .filter((s) => s.visible)
    .filter((s) => (publicMode ? whatsAppGuideStepHasImage(s) : true))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.stepNumber - b.stepNumber)
}

function StepImageLightbox({
  step,
  onClose,
}: {
  step: WhatsAppGuideStep
  onClose: () => void
}) {
  const url = step.image?.url?.trim()
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  if (!url) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={step.imageAlt}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Kapat"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>
      <div className="max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <MediaImage src={url} alt={step.imageAlt} className="max-h-[90vh] w-full object-contain" />
        <p className="mt-3 text-center text-sm text-white/80">{step.title}</p>
      </div>
    </div>
  )
}

function StepVisual({ step, onExpand }: { step: WhatsAppGuideStep; onExpand: () => void }) {
  const url = step.image?.url?.trim()
  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-8 text-center text-xs text-white/50">
        Görsel henüz yüklenmedi — yalnızca taslak önizlemesinde görünür.
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onExpand}
      className="group w-full overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
      aria-label={`${step.imageAlt} — büyük görüntüle`}
    >
      <MediaImage
        src={url}
        alt={step.imageAlt}
        className="max-h-[min(480px,60vh)] w-full object-contain transition group-hover:brightness-105"
      />
    </button>
  )
}

export function WhatsAppGuideBlockRenderer({ block, mode = 'public' }: BlockRendererProps) {
  if (block.type !== 'whatsapp-guide') return null
  const guide = block as WhatsAppGuideBlock
  if (!guide.visibility.enabled) return null

  const publicMode = mode === 'public'
  const settings = guide.settings
  const platforms = useMemo(() => {
    const list: Platform[] = []
    if (settings.androidEnabled) list.push('android')
    if (settings.iphoneEnabled) list.push('iphone')
    return list
  }, [settings.androidEnabled, settings.iphoneEnabled])

  const [platform, setPlatform] = useState<Platform>(platforms[0] ?? 'android')
  const [activeStep, setActiveStep] = useState(0)
  const [lightboxStep, setLightboxStep] = useState<WhatsAppGuideStep | null>(null)
  const tablistId = useId()

  useEffect(() => {
    if (!platforms.includes(platform)) setPlatform(platforms[0] ?? 'android')
  }, [platform, platforms])

  const platformSteps = useMemo(
    () => sortedVisibleSteps(platform === 'android' ? settings.androidSteps : settings.iphoneSteps, publicMode),
    [platform, settings.androidSteps, settings.iphoneSteps, publicMode],
  )

  const connectionSteps = useMemo(() => {
    const step = settings.connectionStep
    if (!step.visible) return []
    if (publicMode && !whatsAppGuideStepHasImage(step)) return []
    return [step]
  }, [settings.connectionStep, publicMode])

  const allSteps = useMemo(
    () => [...platformSteps, ...connectionSteps].sort((a, b) => a.stepNumber - b.stepNumber),
    [platformSteps, connectionSteps],
  )

  useEffect(() => {
    if (activeStep >= allSteps.length) setActiveStep(0)
  }, [activeStep, allSteps.length])

  const current = allSteps[activeStep]
  const showPlatformTabs = platforms.length > 1

  if (publicMode && allSteps.length === 0) return null

  const closeLightbox = useCallback(() => setLightboxStep(null), [])

  return (
    <section
      id="whatsapp-gecis-rehberi"
      className="scroll-mt-20 bg-gradient-to-br from-[#0f2744] via-[#0d3329] to-[#064e3b] py-14 text-white sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {settings.eyebrow ? (
            <BuilderField path="settings.eyebrow" label="Üst etiket" type="text">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#25D366]">{settings.eyebrow}</p>
            </BuilderField>
          ) : null}
          {renderIfText(guide.title) ? (
            <BuilderField path="title" label="Başlık" type="text">
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{guide.title}</h2>
            </BuilderField>
          ) : null}
          {renderIfText(guide.description) ? (
            <BuilderField path="description" label="Açıklama" type="text" className="mt-4 block">
              <p className="text-base leading-relaxed text-white/75 sm:text-lg">{guide.description}</p>
            </BuilderField>
          ) : null}
        </div>

        {showPlatformTabs ? (
          <div
            role="tablist"
            aria-label="Platform seçimi"
            className="mx-auto mt-10 flex max-w-md justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1"
          >
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                role="tab"
                aria-selected={platform === p}
                onClick={() => {
                  setPlatform(p)
                  setActiveStep(0)
                }}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition',
                  platform === p ? 'bg-[#25D366] text-white' : 'text-white/70 hover:bg-white/10',
                )}
              >
                {p === 'android' ? 'Android' : 'iPhone'}
              </button>
            ))}
          </div>
        ) : null}

        {allSteps.length > 0 && current ? (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:gap-10">
            <div role="tablist" id={tablistId} className="flex flex-col gap-2">
              {allSteps.map((step, index) => {
                const active = activeStep === index
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition',
                      active ? 'border-[#25D366]/50 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10',
                    )}
                  >
                    <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold', active ? 'bg-[#25D366] text-white' : 'bg-white/15 text-white/70')}>
                      {step.stepNumber}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{step.title}</span>
                      {active ? <span className="mt-2 block text-sm text-white/70">{step.description}</span> : null}
                    </span>
                    <ChevronRight className={cn('mt-1 h-4 w-4 shrink-0', active ? 'text-[#25D366]' : 'text-white/30')} aria-hidden />
                  </button>
                )
              })}
            </div>
            <div role="tabpanel" className="space-y-4">
              <StepVisual step={current} onExpand={() => setLightboxStep(current)} />
              {current.officialPath ? (
                <p className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-mono text-xs text-emerald-100/90">
                  {current.officialPath}
                </p>
              ) : null}
              {current.officialUrl ? (
                <a
                  href={current.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#25D366] hover:underline"
                >
                  Resmî WhatsApp rehberi
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        {settings.securityWarningTitle ? (
          <div className="mt-12 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
              <div>
                <h3 className="text-base font-bold text-amber-50">{settings.securityWarningTitle}</h3>
                {settings.securityWarningBody ? (
                  <p className="mt-2 text-sm leading-relaxed text-amber-100/90">{settings.securityWarningBody}</p>
                ) : null}
              </div>
            </div>
            {settings.officialGuideUrl ? (
              <a
                href={settings.officialGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex shrink-0 items-center gap-2 rounded-xl border border-amber-300/40 bg-amber-400/15 px-5 py-3 text-sm font-semibold text-amber-50 sm:mt-0"
              >
                <Smartphone className="h-4 w-4" aria-hidden />
                Resmî WhatsApp rehberini aç
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      {lightboxStep ? <StepImageLightbox step={lightboxStep} onClose={closeLightbox} /> : null}
    </section>
  )
}
