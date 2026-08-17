import { useEffect, useId, useState } from 'react'
import {
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Link2,
  Smartphone,
} from 'lucide-react'

const WHATSAPP_BACKUP_FAQ = 'https://faq.whatsapp.com/1144861179456352'
const WHATSAPP_TRANSFER_FAQ = 'https://faq.whatsapp.com/3059780464322392'
const PLAY_STORE_W4B = 'https://play.google.com/store/apps/details?id=com.whatsapp.w4b'
const APP_STORE_W4B = 'https://apps.apple.com/app/whatsapp-business/id1386412985'

const GUIDE_IMAGE_BASE = '/images/muvekkil-kasa/whatsapp-guide'

type Platform = 'android' | 'iphone'

type GuideStep = {
  id: string
  number: number
  title: string
  description: string
  officialPath: Record<Platform, string>
  imageAlt: string
  imageSrc?: Partial<Record<Platform, string>>
  officialUrl?: string
  officialLinks?: { href: string; label: string }[]
  footnote?: string
  criticalNote?: string
  criticalWarning?: string
  isMkConnectionStep?: boolean
}

const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'step-backup',
    number: 1,
    title: 'Mevcut WhatsApp konuşmalarınızı yedekleyin',
    description:
      'Geçişe başlamadan önce son sohbet yedeğinizin güncel olduğundan emin olun. “Şimdi yedekle”ye dokunun ve işlemin tamamlanmasını bekleyin. Yedekleme saatinin güncel olduğunu görmeden sonraki adıma geçmeyin.',
    officialPath: {
      android: 'WhatsApp > ⋮ > Ayarlar > Sohbetler > Sohbet yedeği',
      iphone: 'WhatsApp > Ayarlar > Sohbetler > Sohbet Yedeği',
    },
    imageAlt: 'WhatsApp sohbet yedeği ekranı',
    imageSrc: {
      android: `${GUIDE_IMAGE_BASE}/android/01-yedekleme.webp`,
      iphone: `${GUIDE_IMAGE_BASE}/iphone/01-yedekleme.webp`,
    },
    officialUrl: WHATSAPP_BACKUP_FAQ,
  },
  {
    id: 'step-install',
    number: 2,
    title: 'WhatsApp’ı güncelleyin ve WhatsApp Business’ı yükleyin',
    description:
      'Uygulamayı yalnızca Google Play veya App Store’dan indirin. Geliştirici adının WhatsApp LLC olduğunu kontrol edin. Normal WhatsApp uygulamasını henüz kaldırmayın ve WhatsApp hesabınızı silmeyin.',
    officialPath: {
      android: 'Google Play > WhatsApp Business (WhatsApp LLC)',
      iphone: 'App Store > WhatsApp Business (WhatsApp LLC)',
    },
    imageAlt: 'WhatsApp Business mağaza yükleme ekranı',
    imageSrc: {
      android: `${GUIDE_IMAGE_BASE}/android/02-business-kurulum.webp`,
      iphone: `${GUIDE_IMAGE_BASE}/iphone/02-business-kurulum.webp`,
    },
    officialLinks: [
      { href: PLAY_STORE_W4B, label: 'Google Play' },
      { href: APP_STORE_W4B, label: 'App Store' },
    ],
  },
  {
    id: 'step-verify',
    number: 3,
    title: 'WhatsApp Business’ı açıp mevcut numaranızla devam edin',
    description:
      'Normal WhatsApp’ta kullandığınız aynı telefon numarasını WhatsApp Business içinde doğrulayın. Ülke kodunu ve mevcut telefon numaranızı girin. SMS veya arama yoluyla gelen doğrulama kodunu tamamlayın. Yeni veya farklı numara yazarsanız eski hesabınızdaki sohbetler aktarılmaz.',
    officialPath: {
      android: 'WhatsApp Business > Telefon numaranızı doğrulayın',
      iphone: 'WhatsApp Business > Telefon numaranızı doğrulayın',
    },
    imageAlt: 'WhatsApp Business numara doğrulama ekranı',
    imageSrc: {
      android: `${GUIDE_IMAGE_BASE}/android/03-numara-dogrulama.webp`,
      iphone: `${GUIDE_IMAGE_BASE}/iphone/03-numara-dogrulama.webp`,
    },
    footnote: 'Bu rehber aynı telefon ve aynı numara ile yapılan geçiş içindir.',
  },
  {
    id: 'step-transfer',
    number: 4,
    title: 'İstenirse SMS koduyla numarayı doğrulayın ve hesap/sohbet aktarımını onaylayın',
    description:
      'WhatsApp Business mevcut hesabınızı bulduğunda sohbet geçmişini aktarma seçeneğini kesinlikle atlamayın. Ekrandaki “Devam Et”, “İzin Ver” ve “Aktar / Geri Yükle” adımlarını tamamlayın. Aktarım sürerken uygulamayı kapatmayın.',
    officialPath: {
      android: 'WhatsApp Business > Sohbet geçmişi bulundu > Devam Et / Geri Yükle',
      iphone: 'WhatsApp Business > Sohbet geçmişi bulundu > Devam Et / Geri Yükle',
    },
    imageAlt: 'WhatsApp Business hesap ve sohbet aktarım ekranı',
    imageSrc: {
      android: `${GUIDE_IMAGE_BASE}/android/04-hesap-aktarimi.webp`,
      iphone: `${GUIDE_IMAGE_BASE}/iphone/04-hesap-aktarimi.webp`,
    },
    officialUrl: WHATSAPP_TRANSFER_FAQ,
    criticalWarning:
      '“Atla” veya “Şimdi değil” seçeneğine basmayın. Aksi hâlde eski konuşmalarınız WhatsApp Business içinde görünmeyebilir.',
  },
  {
    id: 'step-verify-chats',
    number: 5,
    title: 'Sohbetlerin ve kişilerin WhatsApp Business içinde göründüğünü kontrol edin',
    description:
      'WhatsApp Business içindeki sohbet listesini açın. Eski kişilerinizin ve konuşmalarınızın göründüğünü kontrol edin. Ardından güvendiğiniz bir kişiye deneme mesajı gönderin ve mesaj alabildiğinizden emin olun.',
    officialPath: {
      android: 'WhatsApp Business > Sohbetler',
      iphone: 'WhatsApp Business > Sohbetler',
    },
    imageAlt: 'WhatsApp Business sohbet listesi',
    imageSrc: {
      android: `${GUIDE_IMAGE_BASE}/android/05-sohbet-kontrolu.webp`,
      iphone: `${GUIDE_IMAGE_BASE}/iphone/05-sohbet-kontrolu.webp`,
    },
  },
  {
    id: 'step-connect',
    number: 6,
    title: 'Müvekkil Kasası’na dönerek Meta bağlantı akışını başlatın',
    description:
      'Sohbetleriniz görünüyorsa Müvekkil Kasası’na dönün ve “WhatsApp Business’ı Bağla” seçeneğini açın. “WhatsApp Business ile bağlan”ı seçin, ardından Meta’nın açtığı ekrandaki yetkilendirme adımlarını tamamlayın. Bağlantı tamamlandığında işletme numaranız Müvekkil Kasası içinde bağlı olarak görünür.',
    officialPath: {
      android: 'Müvekkil Kasası > Ayarlar > WhatsApp Bağlantısı > Meta yetkilendirme',
      iphone: 'Müvekkil Kasası > Ayarlar > WhatsApp Bağlantısı > Meta yetkilendirme',
    },
    imageAlt: 'Müvekkil Kasası Meta WhatsApp Business bağlantı ekranı',
    imageSrc: {
      android: `${GUIDE_IMAGE_BASE}/06-muvekkil-kasa-meta-baglantisi.webp`,
      iphone: `${GUIDE_IMAGE_BASE}/06-muvekkil-kasa-meta-baglantisi.webp`,
    },
    footnote: 'Bu adım WhatsApp uygulaması ekranı değildir; Müvekkil Kasası web bağlantı akışıdır.',
    isMkConnectionStep: true,
  },
]

function useImageAvailable(src?: string): boolean | null {
  const [available, setAvailable] = useState<boolean | null>(src ? null : false)

  useEffect(() => {
    if (!src) {
      setAvailable(false)
      return
    }

    setAvailable(null)
    const img = new Image()
    img.onload = () => setAvailable(true)
    img.onerror = () => setAvailable(false)
    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return available
}

function OfficialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#25D366] underline-offset-2 transition hover:text-[#20bd5a] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
    </a>
  )
}

function OfficialStepSummaryCard({
  platform,
  step,
}: {
  platform: Platform
  step: GuideStep
}) {
  const platformLabel = platform === 'android' ? 'Android' : 'iPhone'

  if (step.isMkConnectionStep) {
    return (
      <div className="rounded-xl border border-white/15 bg-gradient-to-br from-slate-900/40 to-slate-800/30 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Web bağlantı özeti</p>
        <h3 className="mt-2 text-base font-bold text-white">Müvekkil Kasası — Meta WhatsApp Business bağlantısı</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/75">{step.description}</p>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-300/90">Menü yolu</p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-emerald-100/90">{step.officialPath[platform]}</p>
        </div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/60">
          <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Bu adım yalnızca rehber amaçlıdır; Embedded Signup veya demo akışını burada başlatmaz.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/15 bg-gradient-to-br from-slate-900/40 to-slate-800/30 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">Resmî adım özeti</p>
      <h3 className="mt-2 text-base font-bold text-white">{step.title}</h3>
      <p className="mt-2 text-xs font-medium text-white/60">Platform: {platformLabel}</p>
      <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-300/90">Menü yolu</p>
        <p className="mt-1 font-mono text-xs leading-relaxed text-emerald-100/90">{step.officialPath[platform]}</p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/75">{step.description}</p>
      {step.officialUrl ? (
        <div className="mt-4">
          <OfficialLink href={step.officialUrl} label="Resmî WhatsApp rehberi" />
        </div>
      ) : null}
    </div>
  )
}

function StepVisualPanel({
  platform,
  step,
}: {
  platform: Platform
  step: GuideStep
}) {
  const imageSrc = step.imageSrc?.[platform]
  const imageAvailable = useImageAvailable(imageSrc)

  if (imageSrc && imageAvailable === true) {
    return (
      <figure className="overflow-hidden rounded-xl border border-white/10 bg-slate-950/40">
        <img
          src={imageSrc}
          alt={step.imageAlt}
          className="mx-auto max-h-[min(480px,60vh)] w-full object-contain"
        />
        <figcaption className="border-t border-white/10 px-4 py-2 text-center text-xs text-white/50">
          {step.imageAlt}
        </figcaption>
      </figure>
    )
  }

  return <OfficialStepSummaryCard platform={platform} step={step} />
}

function StepDetailContent({
  platform,
  step,
  step5Verified,
  onStep5VerifiedChange,
}: {
  platform: Platform
  step: GuideStep
  step5Verified: boolean
  onStep5VerifiedChange: (value: boolean) => void
}) {
  return (
    <div className="space-y-4">
      <StepVisualPanel platform={platform} step={step} />

      {step.number === 5 ? (
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/20 bg-white/5 p-4">
            <input
              type="checkbox"
              checked={step5Verified}
              onChange={(event) => onStep5VerifiedChange(event.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-white/10 text-[#25D366] focus:ring-2 focus:ring-[#25D366] focus:ring-offset-0"
            />
            <span className="text-sm leading-relaxed text-white/90">
              Eski sohbetlerimi WhatsApp Business içinde görüyorum ve mesaj gönderebiliyorum.
            </span>
          </label>
          {!step5Verified ? (
            <p className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100">
              Sohbetleriniz görünmüyorsa Müvekkil Kasası veya Meta bağlantısına devam etmeyin.
            </p>
          ) : null}
        </div>
      ) : null}

      {step.footnote ? (
        <p className="text-center text-xs font-medium text-white/60">{step.footnote}</p>
      ) : null}

      {step.criticalNote ? (
        <div className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-100">
          {step.criticalNote}
        </div>
      ) : null}

      {step.criticalWarning ? (
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-4 py-3 text-sm font-semibold text-amber-100">
          {step.criticalWarning}
        </div>
      ) : null}

      {step.officialLinks && step.officialLinks.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-4 pt-1">
          {step.officialLinks.map((link) => (
            <OfficialLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function MuvekkilKasaWhatsAppGuide() {
  const [platform, setPlatform] = useState<Platform>('android')
  const [activeStep, setActiveStep] = useState(0)
  const [step5Verified, setStep5Verified] = useState(false)
  const stepTablistId = useId()
  const platformTablistId = useId()
  const panelId = useId()

  const current = GUIDE_STEPS[activeStep]

  return (
    <section
      id="whatsapp-gecis-rehberi"
      className="scroll-mt-20 bg-gradient-to-br from-[#0f2744] via-[#0d3329] to-[#064e3b] py-14 text-white sm:py-20"
      aria-labelledby="whatsapp-guide-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#25D366]">
            WhatsApp Business bağlantısı
          </p>
          <h2
            id="whatsapp-guide-heading"
            className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl"
          >
            Mevcut WhatsApp numaranızı ve eski sohbetlerinizi koruyarak bağlanın.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">
            Normal WhatsApp kullanıyorsanız önce aynı telefonda WhatsApp Business’a geçmeniz gerekir. Aşağıdaki rehber,
            sohbet aktarımı adımını atlamadan güvenli biçimde ilerlemenizi sağlar.
          </p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              'WhatsApp hesabınızı silmeyin',
              'Aynı telefon ve aynı numarayla ilerleyin',
              'Eski sohbetler görünmeden bağlanmayın',
            ].map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm"
              >
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div
          role="tablist"
          id={platformTablistId}
          aria-label="Platform seçimi"
          className="mx-auto mt-10 flex max-w-md justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1"
        >
          {([
            { id: 'android' as const, label: 'Android' },
            { id: 'iphone' as const, label: 'iPhone' },
          ]).map((item) => {
            const selected = platform === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`${platformTablistId}-tab-${item.id}`}
                aria-selected={selected}
                aria-controls={`${platformTablistId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setPlatform(item.id)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3329] ${
                  selected ? 'bg-[#25D366] text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div
          id={`${platformTablistId}-panel`}
          role="tabpanel"
          aria-labelledby={`${platformTablistId}-tab-${platform}`}
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:gap-10 xl:gap-14"
        >
          <div
            role="tablist"
            id={stepTablistId}
            aria-label="WhatsApp Business geçiş adımları"
            className="flex flex-col gap-2"
          >
            {GUIDE_STEPS.map((step, index) => {
              const isActive = activeStep === index
              return (
                <div key={step.id} className="min-w-0">
                  <button
                    type="button"
                    role="tab"
                    id={`${stepTablistId}-tab-${index}`}
                    aria-selected={isActive}
                    aria-controls={`${panelId}-panel-${index}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveStep(index)}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition motion-safe:duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3329] sm:px-5 sm:py-4 ${
                      isActive
                        ? 'border-[#25D366]/50 bg-white/10 shadow-lg shadow-black/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isActive ? 'bg-[#25D366] text-white' : 'bg-white/15 text-white/70'
                      }`}
                    >
                      {step.number}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-semibold sm:text-base ${isActive ? 'text-white' : 'text-white/80'}`}>
                        {step.title}
                      </span>
                      {isActive ? (
                        <span className="mt-2 block text-sm leading-relaxed text-white/70">
                          {step.description}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRight
                      className={`mt-1 h-4 w-4 shrink-0 motion-safe:transition ${isActive ? 'text-[#25D366]' : 'text-white/30'}`}
                      aria-hidden
                    />
                  </button>

                  {isActive ? (
                    <div
                      role="tabpanel"
                      id={`${panelId}-panel-${index}`}
                      aria-labelledby={`${stepTablistId}-tab-${index}`}
                      className="mt-4 lg:hidden"
                    >
                      <StepDetailContent
                        platform={platform}
                        step={step}
                        step5Verified={step5Verified}
                        onStep5VerifiedChange={setStep5Verified}
                      />
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`${panelId}-panel-desktop`}
            aria-labelledby={`${stepTablistId}-tab-${activeStep}`}
            className="hidden lg:block"
          >
            <StepDetailContent
              platform={platform}
              step={current}
              step5Verified={step5Verified}
              onStep5VerifiedChange={setStep5Verified}
            />
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
              <div>
                <h3 className="text-base font-bold text-amber-50 sm:text-lg">
                  Eski konuşmalarınız WhatsApp Business içinde görünmüyorsa durun.
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-amber-100/90">
                  Müvekkil Kasası veya Meta bağlantısına devam etmeyin. Doğru numarayı kullandığınızı ve yedeğin
                  güncel olduğunu kontrol ederek aktarımı tamamlayın.
                </p>
              </div>
            </div>
          </div>
          <a
            href={WHATSAPP_TRANSFER_FAQ}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-amber-400/15 px-5 py-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-400/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d3329] sm:mt-0"
          >
            <Smartphone className="h-4 w-4" aria-hidden />
            Resmî WhatsApp rehberini aç
          </a>
        </div>
      </div>
    </section>
  )
}
