import { BadgeCheck, Check, Headset, Layers3, ShieldCheck } from 'lucide-react'
import type { PublicProductDetail } from '@/types/product'

type Props = {
  product: PublicProductDetail
  bullets: string[]
  isFreeDownload: boolean
}

function buildUseCases(product: PublicProductDetail, isFreeDownload: boolean): string[] {
  const items: string[] = []
  if (product.productType === 'DOWNLOAD') items.push('Masaüstü kullanım ve hızlı kurulum akışı için uygundur.')
  if (product.productType === 'SAAS') items.push('Tarayıcı üzerinden yıllık kullanım ve ekip erişimi için uygundur.')
  if (product.productType === 'SERVICE') items.push('Woontegra ekibiyle planlı teslimat gerektiren dijital hizmetler için uygundur.')
  if (product.licenseRequired) items.push('Lisans yönetimi ve kontrollü aktivasyon gereken yapılara uygundur.')
  if (isFreeDownload) items.push('Hızlı indirip doğrudan kullanmak isteyen kullanıcılar için idealdir.')
  if (product.category?.name) items.push(`${product.category.name} kategorisindeki iş akışlarına uyumlu şekilde sunulur.`)
  return items.slice(0, 3)
}

function buildTechnicalRows(product: PublicProductDetail, galleryCount: number, isFreeDownload: boolean) {
  const rows = [
    { label: 'Ürün tipi', value: product.productType === 'SAAS' ? 'Web tabanlı / abonelik' : product.productType === 'SERVICE' ? 'Dijital hizmet' : 'Masaüstü yazılım' },
    { label: 'Teslimat', value: isFreeDownload ? 'Anında indirme' : product.productType === 'SERVICE' ? 'Planlı dijital teslimat' : 'Satın alma sonrası dijital teslimat' },
    { label: 'Lisans', value: product.licenseRequired ? 'Merkezi lisans' : 'Standart kullanım' },
  ]
  if (product.version?.trim()) rows.push({ label: 'Sürüm', value: product.version.trim() })
  if (galleryCount > 0) rows.push({ label: 'Galeri', value: `${galleryCount} görsel` })
  if (product.licenseDays != null && product.licenseDays > 0) rows.push({ label: 'Lisans süresi', value: `${product.licenseDays} gün` })
  if (product.licenseMaxDevices != null && product.licenseMaxDevices > 0) rows.push({ label: 'Cihaz hakkı', value: `${product.licenseMaxDevices} cihaz` })
  return rows
}

export function ProductContentSections({ product, bullets, isFreeDownload }: Props) {
  const galleryCount = (product.galleryImages?.length ?? 0) + (product.coverImage ? 1 : 0)
  const useCases = buildUseCases(product, isFreeDownload)
  const technicalRows = buildTechnicalRows(product, galleryCount, isFreeDownload)

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.3)] ring-1 ring-slate-900/5 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                <BadgeCheck className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">Ürün detay içeriği</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Genel bakış</h2>
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

          {bullets.length > 0 ? (
            <section className="rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.24)] ring-1 ring-slate-900/5 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-700">
                  <Layers3 className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Avantajlar</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Öne çıkan özellikler</h2>
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

          {useCases.length > 0 ? (
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
                  <li key={item} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700">
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
              {product.licenseRequired ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  Merkezi lisans yönetimi; aktivasyon bilgileri e-posta ile iletilir.
                </li>
              ) : null}
              {product.hasDownload ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  Dijital indirme linki ödeme onayı sonrası paylaşılır.
                </li>
              ) : null}
              {product.productType === 'SERVICE' ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  Hizmet teslimatı Woontegra ekibi tarafından planlanır.
                </li>
              ) : null}
              {isFreeDownload ? (
                <li className="rounded-2xl border border-emerald-100/80 bg-white/75 px-4 py-3 shadow-sm">
                  Ücretsiz sürüm için indirme butonları doğrudan mevcut dosya kaynaklarıyla çalışır.
                </li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.22)] ring-1 ring-slate-900/5 sm:p-7">
            <h2 className="text-xl font-bold tracking-tight text-slate-950">Teknik bilgiler</h2>
            <dl className="mt-5 space-y-3">
              {technicalRows.map((row) => (
                <div key={`${row.label}-${row.value}`} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{row.label}</dt>
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
