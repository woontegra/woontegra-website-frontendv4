import { Link } from 'react-router-dom'
import { LegalList, LegalSection } from '@/components/legal/LegalPageLayout'
import { PageShell } from '@/components/public/PageShell'
import { usePageMeta } from '@/hooks/usePageMeta'
import { ORGANIZATION_LEGAL_NAME } from '@/lib/siteSeo'

const TOC = [
  { id: 'silme-talebi-nasil', label: 'Silme talebi nasıl gönderilir?' },
  { id: 'silinebilecek-veriler', label: 'Silinebilecek veriler' },
  { id: 'islem-sureci', label: 'İşlem süreci' },
  { id: 'meta-baglantisi', label: 'Meta bağlantısını kaldırma' },
  { id: 'iletisim', label: 'İletişim' },
] as const

export function DataDeletionRequestPage() {
  usePageMeta({
    title: 'Kullanıcı Verilerinin Silinmesi | Woontegra MailCenter',
    description:
      'MailCenter ve Meta WhatsApp bağlantıları kapsamında saklanan kullanıcı verilerinin silinmesi için izlenecek adımlar.',
    canonicalPath: '/veri-silme-talebi',
  })

  return (
    <PageShell
      breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Kullanıcı Verilerinin Silinmesi' }]}
      title="Kullanıcı Verilerinin Silinmesi"
      description="Woontegra Teknoloji Yazılım ve Dijital Hizmetler Ltd. Şti. tarafından sunulan MailCenter hizmeti kapsamında işlenen kişisel verilerinizin silinmesini talep edebilirsiniz."
      maxWidth="6xl"
    >
      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">İçindekiler</p>
            <ul className="space-y-1">
              {TOC.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-emerald-700"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="min-w-0 space-y-8">
          <LegalSection title="Silme talebi nasıl gönderilir?" id="silme-talebi-nasil">
            <p>
              Veri silme talebinizi{' '}
              <a href="mailto:info@woontegra.com" className="font-medium text-emerald-700 hover:underline">
                info@woontegra.com
              </a>{' '}
              adresine e-posta göndererek iletebilirsiniz.
            </p>
            <p>
              E-posta konusu:{' '}
              <span className="font-semibold text-slate-900">MailCenter Veri Silme Talebi</span>
            </p>
            <p>Talebinizde aşağıdaki bilgileri paylaşmanızı rica ederiz:</p>
            <LegalList
              items={[
                'Ad ve soyad',
                'MailCenter hesabında kullanılan e-posta adresi',
                'Bağlı Meta/WhatsApp hesabına ait telefon numarası',
                'Varsa firma veya marka adı',
                'Silinmesi istenen hesap ve verilerin kısa açıklaması',
              ]}
            />
          </LegalSection>

          <LegalSection title="Silinebilecek veriler" id="silinebilecek-veriler">
            <LegalList
              items={[
                'MailCenter kullanıcı hesabı bilgileri',
                'Meta/WhatsApp kanal bağlantı kayıtları',
                'Saklanan erişim tokenları ve bağlantı yetkileri',
                'WhatsApp konuşma ve mesaj kayıtları',
                'Kişi ve iletişim bilgileri',
                'Kullanıcı tercihleri ve kanal ayarları',
              ]}
            />
          </LegalSection>

          <LegalSection title="İşlem süreci" id="islem-sureci">
            <LegalList
              items={[
                'Talep alındığında kimlik ve hesap sahipliği doğrulanır.',
                'Sonuç kullanıcıya e-posta ile bildirilir.',
                'Hukuken saklanması zorunlu olmayan veriler silinir veya anonimleştirilir.',
                'Yasal zorunluluk bulunan kayıtlar yalnızca gerekli süre boyunca korunur.',
              ]}
            />
          </LegalSection>

          <LegalSection title="Meta bağlantısını kaldırma" id="meta-baglantisi">
            <p>
              MailCenter içinde Meta/WhatsApp kanal bağlantısını kaldırmak için şu adımları izleyebilirsiniz:
            </p>
            <ol className="list-decimal space-y-2 pl-5">
              <li>Kanal Bağlantıları</li>
              <li>WhatsApp</li>
              <li>Bağlantıyı Kaldır</li>
            </ol>
            <p>
              Bağlantıyı kaldırmak ilgili kanalı pasif hale getirir. Geçmiş verilerin tamamen silinmesi için bu
              sayfada açıklanan veri silme talebini ayrıca göndermeniz gerekir.
            </p>
          </LegalSection>

          <LegalSection title="İletişim" id="iletisim">
            <p className="font-medium text-slate-900">{ORGANIZATION_LEGAL_NAME}</p>
            <p>
              E-posta:{' '}
              <a href="mailto:info@woontegra.com" className="font-medium text-emerald-700 hover:underline">
                info@woontegra.com
              </a>
            </p>
            <p>
              Web:{' '}
              <a
                href="https://www.woontegra.com"
                className="font-medium text-emerald-700 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.woontegra.com
              </a>
            </p>
          </LegalSection>

          <p className="border-t border-slate-200 pt-6 text-sm text-slate-600">
            Kişisel verilerin işlenmesi hakkında daha fazla bilgi için{' '}
            <Link to="/gizlilik-politikasi" className="font-medium text-emerald-700 hover:underline">
              Gizlilik Politikası
            </Link>{' '}
            sayfasını inceleyebilirsiniz.
          </p>
        </div>
      </div>
    </PageShell>
  )
}
