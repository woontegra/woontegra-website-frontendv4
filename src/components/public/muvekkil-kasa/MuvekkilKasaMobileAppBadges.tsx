/**
 * Müvekkil Kasa mobil uygulama indirme rozetleri (sayfanın üst bölümünde, başlığın altında).
 * Bir mağaza linki boşsa o rozet soluk "Yakında" olarak görünür ve tıklanmaz.
 * App Store onaylanınca MK_APP_STORE_URL'ye linki yazmak yeterlidir.
 */
export const MK_GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.muvekkilkasasi.mobile&hl=tr'
export const MK_APP_STORE_URL = ''

const MK_MOBILE_APP_NOTE = 'Web sürümü hesabınızla mobil uygulamaya giriş yapabilirsiniz.'

function GooglePlayIcon() {
  return (
    <svg viewBox="0 0 16 18" className="h-6 w-5 shrink-0" aria-hidden>
      <path fill="#4285F4" d="M.6 1.1C.3 1.5.1 2 .1 2.6v12.8c0 .6.2 1.1.5 1.5l.1.1 7.2-7.2v-.2L.7 1z" />
      <path fill="#34A853" d="m11.4 11.6-3.5-3.5v-.2l3.5-3.5.1.1 4.1 2.3c1.2.7 1.2 1.8 0 2.5l-4.1 2.3z" />
      <path fill="#FBBC04" d="M11.5 11.5 8 8  .7 15.3c.4.4 1 .5 1.6.1l9.2-3.9z" />
      <path fill="#EA4335" d="M11.5 4.5 2.3.6C1.7.2 1.1.3.7 1.1L8 8z" />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 18 22" className="h-6 w-5 shrink-0" aria-hidden>
      <path
        fill="currentColor"
        d="M14.7 11.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.7-2.2c.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.9zM12.4 4.8c.6-.8 1.1-1.8.9-2.9-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.8 1.1.1 2.1-.5 2.9-1.3z"
      />
    </svg>
  )
}

const BADGE_BASE =
  'flex min-h-[3.25rem] w-full items-center gap-2.5 rounded-xl border border-white/15 bg-black/70 px-4 py-2 text-left text-white backdrop-blur sm:w-auto sm:min-w-[11.5rem]'

function StoreBadge({
  href,
  icon,
  kicker,
  label,
}: {
  href: string
  icon: React.ReactNode
  kicker: string
  label: string
}) {
  const content = (
    <>
      {icon}
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase leading-none tracking-wide text-white/70">{kicker}</span>
        <span className="mt-1 block text-sm font-semibold leading-none">{label}</span>
        {href ? null : (
          <span className="mt-1 block text-[10px] font-medium leading-none text-white/60">Yakında</span>
        )}
      </span>
    </>
  )
  if (!href) {
    return (
      <span className={`${BADGE_BASE} cursor-not-allowed opacity-60`} aria-label={`${label} — yakında`}>
        {content}
      </span>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${BADGE_BASE} transition hover:border-white/30 hover:bg-black/85`}
      aria-label={`${label} — Müvekkil Kasa mobil uygulamasını indir`}
    >
      {content}
    </a>
  )
}

export function MuvekkilKasaMobileAppBadges({ className = 'mt-6' }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <StoreBadge href={MK_GOOGLE_PLAY_URL} icon={<GooglePlayIcon />} kicker="Şimdi indirin" label="Google Play" />
        <StoreBadge
          href={MK_APP_STORE_URL}
          icon={<AppleIcon />}
          kicker={MK_APP_STORE_URL ? "App Store'dan indirin" : 'Çok yakında'}
          label="App Store"
        />
      </div>
      <p className="mt-3 text-sm text-slate-400">{MK_MOBILE_APP_NOTE}</p>
    </div>
  )
}
