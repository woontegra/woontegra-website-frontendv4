import { useState } from 'react'
import { AktueryaSalesShowcase } from '@/components/public/aktuerya/AktueryaSalesShowcase'
import {
  AKTUERYA_AUDIENCE,
  AKTUERYA_FAQ,
  AKTUERYA_LOGO_HORIZONTAL,
  AKTUERYA_REASONS,
  getDefaultAktueryaPageContent,
  type AktueryaPageContent,
} from '@/data/aktueryaProduct'

const SHELL = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'

function ShotFrame({
  caption,
  alt,
  src,
}: {
  caption: string
  alt: string
  src: string | null
}) {
  if (src) {
    return (
      <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <img src={src} alt={alt} className="aspect-[16/10] w-full object-cover object-top" />
        <figcaption className="border-t border-slate-200 px-4 py-2.5 text-sm text-slate-600">{caption}</figcaption>
      </figure>
    )
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
      <div className="flex aspect-[16/10] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium text-slate-700">Ekran görüntüsü yeri</p>
        <p className="mt-1 text-sm text-slate-500">{caption}</p>
      </div>
      <figcaption className="border-t border-slate-200 px-4 py-2.5 text-sm text-slate-600">{caption}</figcaption>
    </figure>
  )
}

function StoreSoonBadge({
  kind,
  kicker,
  label,
}: {
  kind: 'google' | 'apple'
  kicker: string
  label: string
}) {
  const className =
    'flex min-h-[3.4rem] w-full cursor-not-allowed items-center gap-2.5 rounded-lg bg-black/80 px-3 py-2 text-left text-white opacity-80'
  return (
    <button type="button" disabled className={className} aria-label={`${kicker} ${label}. Çok yakında`}>
      {kind === 'google' ? (
        <svg viewBox="0 0 16 18" className="h-6 w-5 shrink-0" aria-hidden>
          <path fill="#4285F4" d="M.6 1.1C.3 1.5.1 2 .1 2.6v12.8c0 .6.2 1.1.5 1.5l.1.1 7.2-7.2v-.2L.7 1z" />
          <path fill="#34A853" d="m11.4 11.6-3.5-3.5v-.2l3.5-3.5.1.1 4.1 2.3c1.2.7 1.2 1.8 0 2.5l-4.1 2.3z" />
          <path fill="#FBBC04" d="M11.5 11.5 8 8  .7 15.3c.4.4 1 .5 1.6.1l9.2-3.9z" />
          <path fill="#EA4335" d="M11.5 4.5 2.3.6C1.7.2 1.1.3.7 1.1L8 8z" />
        </svg>
      ) : (
        <svg viewBox="0 0 18 22" className="h-6 w-5 shrink-0" aria-hidden>
          <path
            fill="currentColor"
            d="M14.7 11.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8c-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.3 2.9 2.3 1.1 0 1.6-.7 3-.7s1.8.7 3 .7 2-.1 2.7-2.2c.8-1.2 1.2-2.4 1.2-2.5-.1 0-2.3-.9-2.3-3.9zM12.4 4.8c.6-.8 1.1-1.8.9-2.9-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.8 1.1.1 2.1-.5 2.9-1.3z"
          />
        </svg>
      )}
      <span className="min-w-0">
        <span className="block text-[10px] font-medium uppercase leading-none tracking-wide text-white/75">{kicker}</span>
        <span className="mt-1 block text-sm font-semibold leading-none">{label}</span>
        <span className="mt-1 block text-[10px] font-medium leading-none text-white/70">Çok yakında</span>
      </span>
    </button>
  )
}

function SoonButtons({ tone }: { tone: 'on-navy' | 'on-light' }) {
  const primary =
    tone === 'on-navy' ? 'bg-white/80 text-[#123b63]' : 'bg-slate-300 text-slate-600'
  const secondary =
    tone === 'on-navy'
      ? 'border border-white/40 text-white/80'
      : 'border border-slate-300 bg-white text-slate-500'
  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" disabled className={`cursor-not-allowed rounded-lg px-4 py-2.5 text-sm font-semibold ${primary}`}>
        Çok yakında
      </button>
      <button type="button" disabled className={`cursor-not-allowed rounded-lg px-4 py-2.5 text-sm font-semibold ${secondary}`}>
        Çok yakında
      </button>
    </div>
  )
}

/** Tanıtım sayfası görünümü: sepet, ödeme ve demo isteği yok; düğmeler sabit “Çok yakında”. */
export function AktueryaProductView({ content }: { content?: AktueryaPageContent }) {
  const page = content ?? getDefaultAktueryaPageContent()
  const shots = (page.gallery.length
    ? page.gallery
    : [{ id: 'bos', caption: 'Ekran görüntüsü', alt: 'Aktüerya Hesaplama ekran görüntüsü', url: '' }]
  ).map((shot) => ({
    id: shot.id,
    caption: shot.caption,
    alt: shot.alt,
    src: shot.url || null,
  }))
  const [openFaq, setOpenFaq] = useState<string | null>(AKTUERYA_FAQ[0]?.question ?? null)

  return (
    <div className="overflow-x-clip bg-white text-slate-800">
      <AktueryaSalesShowcase
        demoDays={page.demoDays}
        demoCredits={page.demoCredits}
        heroTitle={page.heroTitle}
        heroHeadline={page.heroHeadline}
        heroLead={page.heroLead}
        logoSrc={page.logoUrl || AKTUERYA_LOGO_HORIZONTAL}
        heroImageSrc={page.heroImageUrl || null}
        shots={shots}
      />

      {page.sections.modules ? (
        <section className="border-b border-slate-200 py-10" aria-labelledby="aktuerya-moduller">
          <div className={SHELL}>
            <h2 id="aktuerya-moduller" className="text-xl font-semibold tracking-tight text-slate-950">
              Hesap modülleri
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Trafik ve iş kazası dosyalarında kullanılan dört hesap türü.
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {page.modules.map((item) => (
                <li key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-[#123b63]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.sections.features ? (
        <section className="border-b border-slate-200 bg-slate-50 py-10" aria-labelledby="aktuerya-ozellikler">
          <div className={SHELL}>
            <h2 id="aktuerya-ozellikler" className="text-xl font-semibold tracking-tight text-slate-950">
              Programın öne çıkan özellikleri
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {page.features.map((item) => (
                <li key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.sections.gallery ? (
        <section className="border-b border-slate-200 py-10" aria-labelledby="aktuerya-goruntuler">
          <div className={SHELL}>
            <h2 id="aktuerya-goruntuler" className="text-xl font-semibold tracking-tight text-slate-950">
              Programdan görüntüler
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Hesap türleri, sonuç ve kayıtlı çalışmalar.
            </p>
            <ul className="mt-5 grid gap-4 lg:grid-cols-3">
              {shots.map((shot) => (
                <li key={shot.id}>
                  <ShotFrame caption={shot.caption} alt={shot.alt} src={shot.src} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.sections.audience ? (
        <section className="border-b border-slate-200 bg-slate-50 py-10" aria-labelledby="aktuerya-kimler">
          <div className={SHELL}>
            <h2 id="aktuerya-kimler" className="text-xl font-semibold tracking-tight text-slate-950">
              Kimler için?
            </h2>
            <ul className="mt-5 grid gap-3 md:grid-cols-3">
              {AKTUERYA_AUDIENCE.map((item) => (
                <li key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="text-sm font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.sections.reasons ? (
        <section className="border-b border-slate-200 py-10" aria-labelledby="aktuerya-neden">
          <div className={SHELL}>
            <h2 id="aktuerya-neden" className="text-xl font-semibold tracking-tight text-slate-950">
              Neden Aktüerya?
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {AKTUERYA_REASONS.map((item) => (
                <li key={item.title} className="rounded-2xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-[#123b63]">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.sections.demo ? (
        <section id="aktuerya-demo" className="border-b border-slate-200 py-10" aria-labelledby="aktuerya-demo-baslik">
          <div className={`${SHELL} grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center`}>
            <div>
              <h2 id="aktuerya-demo-baslik" className="text-xl font-semibold tracking-tight text-slate-950">
                Demo
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Demo talebi ve satın alma bu sayfada henüz açık değildir. Deneme {page.demoDays} gün / {page.demoCredits}{' '}
                hesap kredisi planlanmaktadır.
              </p>
              <button
                type="button"
                disabled
                className="mt-4 cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600"
              >
                Çok yakında
              </button>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">Deneme kapsamı</p>
              <p className="mt-2">{page.demoDays} gün</p>
              <p className="mt-1">{page.demoCredits} hesap kredisi</p>
            </div>
          </div>
        </section>
      ) : null}

      {page.sections.faq ? (
        <section className="border-b border-slate-200 bg-slate-50 py-10" aria-labelledby="aktuerya-sss">
          <div className={SHELL}>
            <div className="max-w-3xl">
              <h2 id="aktuerya-sss" className="text-xl font-semibold tracking-tight text-slate-950">
                Sık sorulan sorular
              </h2>
              <div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
                {AKTUERYA_FAQ.map((item) => {
                  const open = openFaq === item.question
                  return (
                    <div key={item.question}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-semibold text-slate-900"
                        aria-expanded={open}
                        onClick={() => setOpenFaq(open ? null : item.question)}
                      >
                        {item.question}
                        <span aria-hidden className="text-slate-400">
                          {open ? '−' : '+'}
                        </span>
                      </button>
                      {open ? <p className="px-4 pb-3 text-sm leading-relaxed text-slate-600">{item.answer}</p> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {page.sections.mobile ? (
        <section className="border-b border-slate-200 py-10" aria-labelledby="aktuerya-mobil">
          <div className={SHELL}>
            <h2 id="aktuerya-mobil" className="text-xl font-semibold tracking-tight text-slate-950">
              {page.mobileTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{page.mobileText}</p>
            <div className="mt-5 grid max-w-md grid-cols-2 gap-3">
              <StoreSoonBadge kind="google" kicker={page.googlePlayKicker} label={page.googlePlayLabel} />
              <StoreSoonBadge kind="apple" kicker={page.appStoreKicker} label={page.appStoreLabel} />
            </div>
          </div>
        </section>
      ) : null}

      {page.sections.closing ? (
        <section className="bg-[#123b63] py-10 text-white" aria-labelledby="aktuerya-kapanis">
          <div className={SHELL}>
            <h2 id="aktuerya-kapanis" className="text-xl font-semibold tracking-tight">
              {page.heroTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-200">Satın alma ve demo çok yakında.</p>
            <div className="mt-5">
              <SoonButtons tone="on-navy" />
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
