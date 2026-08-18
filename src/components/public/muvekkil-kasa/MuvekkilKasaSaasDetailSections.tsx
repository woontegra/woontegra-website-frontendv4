import { useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  MessageCircle,
  Receipt,
  Scale,
  Shield,
  TrendingUp,
  User,
  Users,
  Wallet,
} from 'lucide-react'
import { MuvekkilKasaWhatsAppGuide } from '@/components/public/product/MuvekkilKasaWhatsAppGuide'

export function FileVaultMockup() {
  const rows = [
    { date: '12.03.2026', doc: 'TM-1842', type: 'Tahsilat', amount: '+₺15.000', tone: 'text-emerald-600' },
    { date: '08.03.2026', doc: 'MS-991', type: 'Masraf', amount: '-₺2.400', tone: 'text-rose-600' },
    { date: '01.03.2026', doc: 'AV-440', type: 'Avans', amount: '+₺40.000', tone: 'text-sky-600' },
  ]
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
      <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dosya kasası</p>
        <p className="mt-1 text-sm font-bold text-slate-900">Ayşe Yılmaz — 2024/184</p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-slate-100">
        {[
          { label: 'Alınan avans', value: '₺40.000' },
          { label: 'Yapılan masraf', value: '₺8.200' },
          { label: 'Kalan bakiye', value: '₺46.800', highlight: true },
        ].map((item) => (
          <div key={item.label} className="bg-white px-3 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
            <p
              className={`mt-1 text-sm font-bold tabular-nums ${item.highlight ? 'text-sky-600' : 'text-slate-800'}`}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="px-4 py-2 font-semibold">Tarih</th>
              <th className="px-2 py-2 font-semibold">Belge</th>
              <th className="px-2 py-2 font-semibold">İşlem</th>
              <th className="px-4 py-2 text-right font-semibold">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.doc} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5 text-slate-500">{row.date}</td>
                <td className="px-2 py-2.5 font-medium text-slate-700">{row.doc}</td>
                <td className="px-2 py-2.5 text-slate-600">{row.type}</td>
                <td className={`px-4 py-2.5 text-right font-semibold tabular-nums ${row.tone}`}>{row.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function InstallmentWhatsAppMockup() {
  return (
    <div className="relative w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-sky-600" aria-hidden />
            <p className="text-sm font-semibold text-slate-800">Vadesi yaklaşan taksitler</p>
          </div>
        </div>
        <div className="space-y-2 p-4">
          {[
            { client: 'M. Kaya', due: 'Bugün', status: 'bg-amber-100 text-amber-800' },
            { client: 'S. Arslan', due: '3 gün', status: 'bg-sky-100 text-sky-800' },
            { client: 'E. Çelik', due: 'Gecikmiş', status: 'bg-rose-100 text-rose-800' },
          ].map((item) => (
            <div key={item.client} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <span className="text-sm font-medium text-slate-800">{item.client}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.status}`}>{item.due}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-2 w-[85%] max-w-xs rounded-2xl border border-emerald-200 bg-[#dcf8c6] p-3 shadow-lg sm:-right-4">
        <div className="mb-1 flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-emerald-700" aria-hidden />
          <span className="text-[10px] font-semibold text-emerald-800">WhatsApp Business</span>
        </div>
        <p className="text-xs leading-relaxed text-slate-800">
          Sayın vekilimiz, 2024/184 dosyanıza ait vekalet taksiti için kalan bakiye ₺12.500&apos;dir. Ödeme
          planınızı hatırlatmak isteriz.
        </p>
        <p className="mt-1 text-[10px] text-slate-500">Gönderim: yarın 10:00 · Büro numaranızdan</p>
      </div>
    </div>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  )
}

function BenefitCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">{icon}</div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
    </div>
  )
}

function FaqAccordion() {
  const items = [
    {
      q: 'Programı bilgisayarıma kurmam gerekiyor mu?',
      a: 'Hayır. Müvekkil Kasası web tabanlıdır; modern bir tarayıcı ve internet bağlantısı yeterlidir. Kurulum veya sunucu yönetimi gerekmez.',
    },
    {
      q: 'Birden fazla çalışan kullanabilir mi?',
      a: 'Evet. Büronuzdaki yetkili kullanıcılar aynı hesap üzerinden tarayıcıdan erişebilir. Kimin hangi işlemi yaptığı kayıt altında tutulur.',
    },
    {
      q: 'Normal WhatsApp numaramı kullanabilir miyim?',
      a: 'Hatırlatmalar WhatsApp Business üzerinden gönderilir. Büronuzun WhatsApp Business numarasını bağlayarak müvekkillerinize tanıdık numaranızdan ulaşabilirsiniz.',
    },
    {
      q: 'Eski WhatsApp konuşmalarım silinir mi?',
      a: 'Hayır. Müvekkil Kasası yalnızca belirlediğiniz ödeme hatırlatmalarını gönderir; mevcut WhatsApp sohbet geçmişinize dokunmaz.',
    },
    {
      q: 'Demo sonunda verilerim kaybolur mu?',
      a: 'Demo hesabınızı lisansladığınızda mevcut verileriniz korunur. Ücretli lisansa geçişte aynı hesap üzerinden devam edersiniz.',
    },
    {
      q: 'Verilerime farklı bilgisayardan erişebilir miyim?',
      a: 'Evet. Verileriniz güvenli sunucularda tutulur; ofis, ev veya mahkeme gibi farklı cihazlardan tarayıcı ile erişebilirsiniz.',
    },
  ]
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6"
              aria-expanded={open}
            >
              <span className="text-sm font-semibold text-slate-900 sm:text-base">{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {open ? (
              <div className="px-5 pb-4 text-sm leading-relaxed text-slate-600 sm:px-6">{item.a}</div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

function scrollToWhatsAppGuide() {
  document.getElementById('whatsapp-gecis-rehberi')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function MuvekkilKasaSaasIntroSections() {
  return (
    <>
      <section className="border-y border-slate-200 bg-white py-10 sm:py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 sm:px-6 lg:flex-row lg:justify-between lg:gap-12 xl:px-8">
          <p className="max-w-xl text-center text-lg font-semibold text-slate-800 lg:text-left lg:text-xl">
            Hâlâ farklı Excel dosyaları, WhatsApp notları ve ajandalar arasında mı çalışıyorsunuz?
          </p>
          <ul className="grid w-full max-w-lg gap-3 sm:grid-cols-3 lg:max-w-none lg:flex lg:w-auto lg:gap-8">
            {['Tek güncel kayıt', 'Daha az unutulan tahsilat', 'Müvekkile hızlı hesap verme'].map((item) => (
              <li
                key={item}
                className="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-center text-sm font-semibold text-sky-900"
              >
                <Check className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
          <SectionHeading title="Büronuzda ne değişecek?" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <BenefitCard
              icon={<Wallet className="h-5 w-5" aria-hidden />}
              title="Her müvekkilin parasını ayrı izleyin"
              description="Avans, masraf, tahsilat ve bakiye hareketleri dosya bazında karışmadan ilerler."
            />
            <BenefitCard
              icon={<CalendarDays className="h-5 w-5" aria-hidden />}
              title="Vadesi yaklaşan taksitleri kaçırmayın"
              description="Yaklaşan ve geciken vekalet taksitlerini tek ekranda görün; hatırlatma düzeninizi kurun."
            />
            <BenefitCard
              icon={<MessageCircle className="h-5 w-5" aria-hidden />}
              title="WhatsApp hatırlatmalarını otomatikleştirin"
              description="Ödeme hatırlatmalarını belirlediğiniz zamanda büronuzun WhatsApp Business numarasından iletin."
            />
            <BenefitCard
              icon={<Users className="h-5 w-5" aria-hidden />}
              title="Büro ekibi aynı güncel veriyi kullansın"
              description="Yetkili kullanıcılar tarayıcıdan erişsin; kimin hangi işlemi yaptığı kayıt altında kalsın."
            />
          </div>
        </div>
      </section>
    </>
  )
}

export function MuvekkilKasaSaasPostPurchaseSections() {
  return (
    <>
      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Bu dosyada ne kadar para kaldı? sorusunun cevabı saniyeler içinde.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Her müvekkilin birden fazla dosyasını ayrı yönetin. Alınan avansları, yapılan masrafları ve
                tahsilatları belge numarasıyla kaydedin. Kalan bakiyeyi hesap makinesi açmadan görün.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Avans, masraf ve tahsilat hareketleri',
                  'Dosya bazlı otomatik bakiye',
                  'Tarihli ve belge numaralı işlem geçmişi',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700 sm:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end">
              <FileVaultMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
              <InstallmentWhatsAppMockup />
            </div>
            <div className="order-1 min-w-0 lg:order-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Taksit tarihlerini takip etmek için ajandaya bağımlı kalmayın.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Vekalet ücretini taksitlendirin; vadesi yaklaşan, bugün ödenecek ve geciken tahsilatları tek
                ekranda görün. Kurallarınızı belirleyin, uygun hatırlatmalar büronuzun WhatsApp Business numarasından
                gönderilsin.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Vade öncesi, vade günü ve vade sonrası kurallar',
                  'Gönderim öncesi açık bakiye kontrolü',
                  'Gönderim saatleri sizin kontrolünüzde',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700 sm:text-base">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={scrollToWhatsAppGuide}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 underline-offset-4 transition hover:text-sky-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                WhatsApp bağlantısı nasıl yapılır?
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Receipt className="h-5 w-5" aria-hidden />,
                title: 'Profesyonel makbuzlar',
                text: 'Tahsilat makbuzlarını düzenli ve standart formatta oluşturun.',
              },
              {
                icon: <Building2 className="h-5 w-5" aria-hidden />,
                title: 'Ofis kasası ve mali kontrol',
                text: 'Büro genelinde kasa hareketlerini tek ekrandan izleyin.',
              },
              {
                icon: <Shield className="h-5 w-5" aria-hidden />,
                title: 'Yetkili ekip erişimi',
                text: 'Kullanıcı yetkileriyle güvenli ve kontrollü erişim sağlayın.',
              },
              {
                icon: <FileText className="h-5 w-5" aria-hidden />,
                title: 'Rapor ve kayıt düzeni',
                text: 'İşlem geçmişi ve raporlarla denetlenebilir kayıt tutun.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
                  {item.icon}
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MuvekkilKasaWhatsAppGuide />

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
          <SectionHeading title="Kimler için uygun?" />
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { icon: <User className="h-6 w-6" aria-hidden />, title: 'Bireysel avukatlar', text: 'Tek başına çalışan ve düzeni dijitalde kurmak isteyen avukatlar.' },
              { icon: <Scale className="h-6 w-6" aria-hidden />, title: 'Hukuk büroları', text: 'Birden fazla avukat ve personelin aynı veriyi kullandığı bürolar.' },
              { icon: <TrendingUp className="h-6 w-6" aria-hidden />, title: 'Tahsilatını düzenli takip etmek isteyenler', text: 'Vadesi yaklaşan ödemeleri kaçırmak istemeyen vekalet sahipleri.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 xl:px-8">
          <SectionHeading title="Sık sorulan sorular" />
          <div className="mt-10">
            <FaqAccordion />
          </div>
        </div>
      </section>
    </>
  )
}

/** Satın alma kartı ve hero olmadan SaaS gövde içeriği (karşılaştırma sekmesi). */
export function MuvekkilKasaSaasDetailSections() {
  return (
    <div className="overflow-x-hidden bg-slate-50">
      <MuvekkilKasaSaasIntroSections />
      <MuvekkilKasaSaasPostPurchaseSections />
    </div>
  )
}
