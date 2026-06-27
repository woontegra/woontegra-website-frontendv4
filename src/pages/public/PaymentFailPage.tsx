import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Headphones,
  Home,
  Package,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react'
import { PaymentOrderSummary } from '@/components/public/payment/PaymentOrderSummary'
import {
  PaymentResultLayout,
  PaymentResultPanel,
  PaymentResultSteps,
  type PaymentResultAction,
} from '@/components/public/payment/PaymentResultLayout'
import { LoadingState } from '@/components/public/LoadingState'
import { usePaymentResultContext } from '@/hooks/usePaymentResultContext'
import { usePageMeta } from '@/hooks/usePageMeta'

const FAILURE_REASONS = [
  'Ödeme işlemi iptal edilmiş olabilir.',
  'Banka veya kart sağlayıcısından onay alınamamış olabilir.',
  'Kart limiti, güvenlik doğrulaması veya 3D Secure adımı tamamlanmamış olabilir.',
]

const RECOVERY_STEPS = [
  'Kart bilgilerinizi kontrol ederek ödemeyi tekrar deneyin.',
  'Mümkünse farklı bir kart veya ödeme yöntemi kullanın.',
  'Sorun devam ederse sipariş referansınızla destek ekibimize yazın.',
]

function buildFailActions(): PaymentResultAction[] {
  return [
    { to: '/odeme', label: 'Ödemeyi tekrar dene', variant: 'primary', icon: RefreshCw },
    { to: '/sepet', label: 'Sepete dön', variant: 'secondary', icon: ShoppingCart },
    { to: '/yazilimlar', label: 'Yazılımlara dön', variant: 'secondary', icon: Package },
    { to: '/iletisim', label: 'İletişim', variant: 'secondary', icon: Headphones },
    { to: '/', label: 'Ana sayfa', variant: 'ghost', icon: Home },
  ]
}

export function PaymentFailPage() {
  const ctx = usePaymentResultContext()
  const { orderNo, orderData, orderLoading } = ctx

  usePageMeta({
    title: orderNo ? `Ödeme başarısız — ${orderNo}` : 'Ödeme başarısız',
    description: 'Ödeme tamamlanamadı. Tekrar deneyebilir veya destek ekibimizle iletişime geçebilirsiniz.',
  })

  if (orderNo && orderLoading && !orderData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-amber-50/60 to-white px-4 py-16">
        <LoadingState label="Sipariş bilgisi kontrol ediliyor…" />
      </div>
    )
  }

  if (orderData?.status === 'PAID' || orderData?.status === 'PROCESSING') {
    return (
      <PaymentResultLayout
        tone="success"
        icon={CheckCircle2}
        eyebrow="Bilgi"
        title="Bu sipariş için ödeme zaten alınmış"
        description={
          <>
            Ödeme kaydınız onaylanmış görünüyor. Sipariş özetinize yönlendirilebilirsiniz.
          </>
        }
        actions={[
          {
            to: `/odeme/basarili${orderData.orderNo ? `/${encodeURIComponent(orderData.orderNo)}` : ''}`,
            label: 'Başarılı ödeme sayfası',
            variant: 'primary',
            icon: Package,
          },
          { to: '/hesabim/siparisler', label: 'Siparişlerim', variant: 'secondary', icon: Package },
        ]}
      >
        <PaymentOrderSummary ctx={ctx} />
      </PaymentResultLayout>
    )
  }

  const backendMessage =
    orderData && 'message' in orderData && orderData.message ? orderData.message : null

  return (
    <PaymentResultLayout
      tone="failure"
      icon={AlertTriangle}
      eyebrow="Ödeme tamamlanamadı"
      title="Ödeme tamamlanamadı"
      description={
        <>
          Endişelenmeyin — kartınızdan tahsilat yapılmamış olabilir. Aşağıdaki adımlarla işlemi yeniden
          deneyebilir veya destek alabilirsiniz.
          {backendMessage ? (
            <span className="mt-3 block rounded-lg border border-amber-200/80 bg-amber-50/80 px-3 py-2 text-sm text-amber-950">
              {backendMessage}
            </span>
          ) : null}
        </>
      }
      trustCards={[
        {
          icon: CreditCard,
          title: 'Kart & limit',
          description: 'Günlük limit, yurtdışı işlem veya banka güvenlik kuralları engel olabilir.',
        },
        {
          icon: RefreshCw,
          title: 'Tekrar deneyin',
          description: 'Çoğu durumda birkaç dakika sonra veya farklı kartla işlem tamamlanır.',
        },
        {
          icon: Headphones,
          title: 'Yanınızdayız',
          description: 'Referans numaranızla iletişime geçerseniz ekibimiz süreci birlikte tamamlar.',
        },
      ]}
      actions={buildFailActions()}
    >
      <PaymentOrderSummary ctx={ctx} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <PaymentResultPanel title="Olası nedenler">
          <ul className="space-y-2.5 text-sm text-slate-700">
            {FAILURE_REASONS.map((reason) => (
              <li key={reason} className="flex gap-2 leading-relaxed">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
                {reason}
              </li>
            ))}
          </ul>
        </PaymentResultPanel>

        <PaymentResultPanel title="Ne yapabilirsiniz?">
          <PaymentResultSteps items={RECOVERY_STEPS} />
        </PaymentResultPanel>
      </div>

      {orderNo || orderData?.orderNo ? (
        <p className="mt-4 text-center text-xs text-slate-500">
          Destek talebinde referans:{' '}
          <span className="font-mono font-semibold text-slate-700">{orderData?.orderNo || orderNo}</span>
          {' · '}
          <Link to="/iletisim" className="font-medium text-emerald-700 hover:underline">
            İletişim formu
          </Link>
        </p>
      ) : null}
    </PaymentResultLayout>
  )
}
