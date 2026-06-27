import { Link } from 'react-router-dom'
import { Mail, MessageCircle } from 'lucide-react'
import { Card, CardBody } from '@/components/ui/Card'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'

export function AccountSupportPage() {
  const { data: settings } = usePublicSiteSettings()
  const email = settings?.contactEmail?.trim() || 'info@woontegra.com'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Destek</h2>
        <p className="mt-1 text-sm text-slate-600">Sipariş, lisans ve indirme konularında size yardımcı olalım.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardBody className="space-y-3">
            <Mail className="h-5 w-5 text-emerald-600" />
            <p className="font-semibold text-slate-900">E-posta desteği</p>
            <p className="text-sm text-slate-600">Sipariş numaranızı ve kayıtlı e-postanızı belirterek yazın.</p>
            <a href={`mailto:${email}`} className="inline-flex text-sm font-semibold text-emerald-700 hover:underline">
              {email}
            </a>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-3">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <p className="font-semibold text-slate-900">İletişim formu</p>
            <p className="text-sm text-slate-600">Detaylı talepleriniz için iletişim sayfamızı kullanın.</p>
            <Link to="/iletisim" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline">
              İletişime geç →
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card className="border-sky-200 bg-sky-50/50">
        <CardBody className="text-sm text-sky-950">
          <p className="font-medium">Sık sorulan konular</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Ödeme onayı sonrası lisans bilgileri e-posta ile iletilir.</li>
            <li>İndirme bağlantıları Hesabım → İndirmelerim ve sipariş detayında görünür.</li>
            <li>Lisans anahtarı e-posta ile gelmediyse destek ekibine sipariş numaranızı iletin.</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
