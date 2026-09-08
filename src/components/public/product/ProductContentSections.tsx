import type { ReactNode } from 'react'
import {
  BadgeCheck,
  Check,
  Headset,
  Layers3,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import type { PublicProductDetail } from '@/types/product'
import { getPromotionalSoftwareMeta, isExternalSalesProduct } from '@/lib/publicSoftwareCatalog'
import {
  getMkCompareDetailOverview,
  MK_COMPARE_DESKTOP_DELIVERY_NOTE,
  MK_COMPARE_WEB_DELIVERY_NOTE,
} from '@/components/public/muvekkil-kasa/mkCompareContent'
import type { MkCompareEdition } from '@/components/public/muvekkil-kasa/comparePageUtils'

type Props = {
  product: PublicProductDetail
  bullets: string[]
  isFreeDownload: boolean
  /** Karşılaştırma sayfası gömme düzeni; varsayılan ürün sayfası görünümünü değiştirmez. */
  variant?: 'default' | 'compare'
  /** compare varyantında sekmeye özel yapılandırılmış genel bakış. */
  compareEdition?: MkCompareEdition
  headings?: {
    overviewEyebrow?: string
    overviewTitle?: string
    featuresEyebrow?: string
    featuresTitle?: string
  }
}

function buildUseCases(product: PublicProductDetail, isFreeDownload: boolean): string[] {
  if (isExternalSalesProduct(product)) {
    return getPromotionalSoftwareMeta(product.slug)?.useCases ?? []
  }

  const items: string[] = []
  if (product.productType === 'DOWNLOAD') items.push('Masaüstü kullanım ve hızlı kurulum akışı için uygundur.')
  if (product.productType === 'SAAS') items.push('Tarayıcı üzerinden yıllık kullanım ve ekip erişimi için uygundur.')
  if (product.productType === 'SERVICE') items.push('Woontegra ekibiyle planlı teslimat gerektiren dijital hizmetler için uygundur.')
  if (product.licenseRequired) items.push('Lisans yönetimi ve kontrollü aktivasyon gereken yapılara uygundur.')
  if (isFreeDownload) items.push('Hızlı indirip doğrudan kullanmak isteyen kullanıcılar için idealdir.')
  if (product.category?.name) items.push(`${product.category.name} kategorisindeki iş akışlarına uyumlu şekilde sunulur.`)
  return items.slice(0, 3)
}

function buildTechnicalRows(
  product: PublicProductDetail,
  galleryCount: number,
  isFreeDownload: boolean,
  isCompare: boolean,
  compareEdition?: MkCompareEdition,
) {
  if (isExternalSalesProduct(product)) {
    const meta = getPromotionalSoftwareMeta(product.slug)
    const rows = [
      { label: 'Ürün tipi', value: meta?.publicProductTypeLabel ?? 'Web Tabanlı Yazılım' },
      { label: 'Teslimat', value: 'Resmi sitede dijital erişim' },
      { label: 'Lisans', value: meta?.licenseSummary ?? 'Resmi sitede' },
    ]
    if (galleryCount > 0) rows.push({ label: 'Galeri', value: `${galleryCount} görsel` })
    return rows
  }

  const compareAccessNote =
    compareEdition === 'saas' ? MK_COMPARE_WEB_DELIVERY_NOTE : MK_COMPARE_DESKTOP_DELIVERY_NOTE

  const rows = [
    {
      label: 'Ürün tipi',
      value:
        product.productType === 'SAAS'
          ? 'Web tabanlı kullanım'
          : product.productType === 'SERVICE'
            ? 'Dijital hizmet'
            : 'Masaüstü yazılım',
    },
    {
      label: 'Teslimat',
      value: isFreeDownload
        ? 'Anında indirme'
        : product.productType === 'SERVICE'
          ? 'Planlı dijital teslimat'
          : 'Satın alma sonrası dijital teslimat',
    },
    {
      label: 'Erişim bilgisi',
      value: product.licenseRequired
        ? isCompare
          ? compareAccessNote
          : 'Lisans bilgileri e-posta ile iletilir'
        : 'Standart kullanım',
    },
  ]
  if (product.version?.trim()) rows.push({ label: 'Sürüm', value: product.version.trim() })
  if (galleryCount > 0) rows.push({ label: 'Galeri', value: `${galleryCount} görsel` })
  if (!isCompare && product.licenseDays != null && product.licenseDays > 0) {
    rows.push({ label: 'Lisans süresi', value: `${product.licenseDays} gün` })
  }
  if (!isCompare && product.licenseMaxDevices != null && product.licenseMaxDevices > 0) {
    rows.push({ label: 'Cihaz hakkı', value: `${product.licenseMaxDevices} cihaz` })
  }
  return rows
}

function OverviewSectionHeading({
  icon,
  eyebrow,
  title,
  tone,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  tone: 'emerald' | 'sky' | 'violet' | 'amber'
}) {
  const tones = {
    emerald: {
      iconWrap: 'bg-emerald-500/10 text-emerald-700',
      eyebrow: 'text-emerald-700',
    },
    sky: {
      iconWrap: 'bg-sky-500/10 text-sky-700',
      eyebrow: 'text-sky-700',
    },
    violet: {
      iconWrap: 'bg-violet-500/10 text-violet-700',
      eyebrow: 'text-violet-700',
    },
    amber: {
      iconWrap: 'bg-amber-500/10 text-amber-700',
      eyebrow: 'text-amber-700',
    },
  } as const
  const t = tones[tone]
  return (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11 ${t.iconWrap}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em] ${t.eyebrow}`}>
          {eyebrow}
        </p>
        <h3 className="mt-0.5 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">{title}</h3>
      </div>
    </div>
  )
}

function OverviewBulletList({
  items,
  markerClass,
}: {
  items: string[]
  markerClass: string
}) {
  return (
    <ul className="mt-4 space-y-2.5 sm:space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.88))] px-3.5 py-3 text-sm leading-relaxed text-slate-700 shadow-sm sm:px-4 sm:py-3.5"
        >
          <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${markerClass}`}
            aria-hidden
          >
            <Check className="h-3 w-3" />
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function CompareStructuredOverview({
  edition,
  eyebrow,
  title,
}: {
  edition: MkCompareEdition
  eyebrow: string
  title: string
}) {
  const overview = getMkCompareDetailOverview(edition)
  const isWeb = edition === 'saas'
  const accent = isWeb ? 'sky' : 'emerald'

  return (
    <section className="rounded-[1.75rem] border border-white/70 bg-white/90 p-5 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/5 sm:rounded-[2rem] sm:p-8">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
            isWeb ? 'bg-sky-500/10 text-sky-700' : 'bg-emerald-500/10 text-emerald-700'
          }`}
        >
          <BadgeCheck className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-[0.22em] ${
              isWeb ? 'text-sky-700' : 'text-emerald-700'
            }`}
          >
            {eyebrow}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
        </div>
      </div>

      <div
        className={`mt-6 rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${
          isWeb
            ? 'border-sky-100 bg-[linear-gradient(135deg,rgba(240,249,255,0.95),rgba(255,255,255,0.98))]'
            : 'border-emerald-100 bg-[linear-gradient(135deg,rgba(236,253,245,0.95),rgba(255,255,255,0.98))]'
        }`}
      >
        <p className="text-[15px] leading-relaxed text-slate-700 sm:text-base sm:leading-relaxed">
          {overview.intro}
        </p>
      </div>

      <div className="mt-7 space-y-7 sm:mt-8 sm:space-y-8">
        <div>
          <OverviewSectionHeading
            tone={accent}
            eyebrow="İşlemler"
            title="Neler yapabilirsiniz?"
            icon={<ListChecks className="h-5 w-5" aria-hidden />}
          />
          <OverviewBulletList
            items={overview.canDo}
            markerClass={isWeb ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700'}
          />
        </div>

        <div>
          <OverviewSectionHeading
            tone="violet"
            eyebrow="Kitle"
            title="Kimler için uygun?"
            icon={<Users className="h-5 w-5" aria-hidden />}
          />
          <OverviewBulletList items={overview.suitableFor} markerClass="bg-violet-100 text-violet-700" />
        </div>

        <div>
          <OverviewSectionHeading
            tone="amber"
            eyebrow="Fark"
            title="Bu sürümün avantajları"
            icon={<Sparkles className="h-5 w-5" aria-hidden />}
          />
          <OverviewBulletList items={overview.advantages} markerClass="bg-amber-100 text-amber-700" />
        </div>
      </div>
    </section>
  )
}

export function ProductContentSections({
  product,
  bullets,
  isFreeDownload,
  variant = 'default',
  compareEdition,
  headings,
}: Props) {
  const galleryCount = (product.galleryImages?.length ?? 0) + (product.coverImage ? 1 : 0)
  const isCompare = variant === 'compare'
  const useCases = buildUseCases(product, isFreeDownload)
  const edition = compareEdition ?? (product.productType === 'SAAS' ? 'saas' : 'desktop')
  const technicalRows = buildTechnicalRows(product, galleryCount, isFreeDownload, isCompare, edition)
  const promotionalMeta = getPromotionalSoftwareMeta(product.slug)
  const isExternalSales = isExternalSalesProduct(product)
  const showStructuredCompare = isCompare
  const compareAccessNote =
    edition === 'saas' ? MK_COMPARE_WEB_DELIVERY_NOTE : MK_COMPARE_DESKTOP_DELIVERY_NOTE

  return (
    <section
      className={
        isCompare
          ? 'mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:py-8'
          : 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14'
      }
    >
      <div
        className={
          isCompare
            ? 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:gap-8'
            : 'grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10'
        }
      >
        <div className="space-y-8">
          {showStructuredCompare ? (
            <CompareStructuredOverview
              edition={edition}
              eyebrow={headings?.overviewEyebrow?.trim() || 'Ürün detay içeriği'}
              title={headings?.overviewTitle?.trim() || 'Genel bakış'}
            />
          ) : (
            <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/5 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                  <BadgeCheck className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                    {headings?.overviewEyebrow?.trim() || 'Ürün detay içeriği'}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    {headings?.overviewTitle?.trim() || 'Genel bakış'}
                  </h2>
                </div>
              </div>
              {product.description ? (
                <div
                  className="prose prose-slate mt-6 max-w-none prose-headings:text-slate-950 prose-p:text-slate-700 prose-li:text-slate-700"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="mt-6 text-slate-600">Bu ürün için açıklama henüz eklenmedi.</p>
              )}
            </section>
          )}

          {!showStructuredCompare && bullets.length > 0 ? (
            <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.24)] ring-1 ring-slate-900/5 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700">
                  <Layers3 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    {headings?.featuresEyebrow?.trim() || 'Avantajlar'}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    {headings?.featuresTitle?.trim() || 'Öne çıkan özellikler'}
                  </h2>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {bullets.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-sky-500 text-white shadow-lg shadow-emerald-500/20">
                        <Check className="h-5 w-5" aria-hidden />
                      </div>
                      <p className="text-base font-semibold leading-relaxed text-slate-900">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {useCases.length > 0 && !isCompare ? (
            <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700">
                  <Headset className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">Kullanım</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Kimler için uygun</h2>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {useCases.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-emerald-100/90 bg-[linear-gradient(180deg,rgba(236,253,245,0.98),rgba(255,255,255,0.98))] p-6 shadow-[0_28px_70px_-42px_rgba(16,185,129,0.2)] ring-1 ring-emerald-900/5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/12 text-emerald-700">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Bilgilendirme</p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Teslimat ve lisans</h2>
              </div>
            </div>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-700">
              {isExternalSales &&
                promotionalMeta?.deliveryNotes.map((note) => (
                  <li key={note} className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                    {note}
                  </li>
                ))}
              {!isExternalSales && product.licenseRequired ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  {isCompare ? compareAccessNote : 'Lisans bilgileri e-posta ile iletilir.'}
                </li>
              ) : null}
              {!isExternalSales && product.hasDownload && !isFreeDownload ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  Dijital indirme linki ödeme onayı sonrası paylaşılır.
                </li>
              ) : null}
              {!isExternalSales && product.productType === 'SERVICE' ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  Hizmet teslimatı Woontegra ekibi tarafından planlanır.
                </li>
              ) : null}
              {isFreeDownload ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  Ücretsiz sürümü indirme butonlarından hemen indirebilirsiniz.
                </li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5 sm:p-7">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Teknik bilgiler</h2>
            <dl className="mt-5 space-y-3">
              {technicalRows.map((row) => (
                <div
                  key={`${row.label}-${row.value}`}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold leading-relaxed text-slate-800">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </section>
  )
}
