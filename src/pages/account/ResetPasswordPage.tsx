import { Link, useSearchParams } from 'react-router-dom'
import { CustomerAuthShell } from '@/components/account/CustomerAuthShell'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

/** Backend: POST /api/customers/reset-password henüz yok — token route UI hazır. */
export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token')

  return (
    <CustomerAuthShell
      title="Yeni şifre belirle"
      subtitle="Güvenli bir şifre seçin ve hesabınıza tekrar erişin."
      footer={
        <Link to="/giris" className="font-semibold text-emerald-700 hover:underline">
          Giriş sayfasına dön
        </Link>
      }
    >
      <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-medium">Müşteri şifre sıfırlama API&apos;si henüz aktif değil.</p>
        <p>
          Backend&apos;de <code className="rounded bg-white/80 px-1">POST /api/customers/reset-password</code> endpoint&apos;i
          olmadığı için bu ekrandan şifre güncellenemiyor.
        </p>
        {token ? (
          <p className="text-xs text-amber-900/80">
            Bağlantı token&apos;ı algılandı; backend hazır olduğunda bu sayfa otomatik çalışacaktır.
          </p>
        ) : (
          <p className="text-xs text-amber-900/80">Geçerli bir sıfırlama bağlantısı bulunamadı.</p>
        )}
      </div>
      <form className="mt-4 space-y-4 opacity-60" aria-disabled="true">
        <Input label="Yeni şifre" type="password" disabled hint="Backend endpoint bekleniyor" />
        <Input label="Yeni şifre tekrar" type="password" disabled />
        <Button type="button" className="w-full" disabled>
          Şifreyi güncelle
        </Button>
      </form>
    </CustomerAuthShell>
  )
}
