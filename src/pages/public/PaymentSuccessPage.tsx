import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Headphones,
  Home,
  KeyRound,
  Package,
  ShieldCheck,
  UserCircle,
} from 'lucide-react'
import { PaymentOrderSummary } from '@/components/public/payment/PaymentOrderSummary'
import {
  PaymentResultLayout,
  PaymentResultPanel,
  PaymentResultSteps,
  type PaymentResultAction,
} from '@/components/public/payment/PaymentResultLayout'
import { LoadingState } from '@/components/public/LoadingState'
import { CENTRAL_LICENSE_EMAIL_MESSAGE } from '@/constants/centralLicenseServer'
import { usePaymentResultContext } from '@/hooks/usePaymentResultContext'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useCustomerSession } from '@/hooks/useCustomerSession'
import { trackPurchase } from '@/integrations/trackingEvents'
import { clearCart } from '@/lib/cartStorage'
import { resolveSaasSuccessKind, saasSuccessNotice } from '@/lib/orderSuccessSaas'
import { SAAS_RENEW_ORDER_KEY } from '@/types/orderSuccess'

function buildSuccessActions(orderNo: string, authed: boolean): PaymentResultAction[] {
  const actions: PaymentResultAction[] = [
    { to: '/yazilimlar', label: 'Yazılımlara dön', variant: 'primary', icon: Package },
    { to: '/', label: 'Ana sayfa', variant: 'secondary', icon: Home },
  ]

  if (authed) {
    actions.push({
      to: orderNo ? `/hesabim/siparisler/${encodeURIComponent(orderNo)}` : '/hesabim/siparisler',
      label: orderNo ? 'Sipariş detayı' : 'Siparişlerim',
      variant: 'secondary',
      icon: UserCircle,
    })
  } else {
    actions.push({
      to: '/giris?return=%2Fhesabim%2Fsiparisler',
      label: 'Hesabım',
      variant: 'secondary',
      icon: UserCircle,
    })
  }

  actions.push({ to: '/iletisim', label: 'Destek', variant: 'ghost', icon: Headphones })
  return actions
}

function buildNextSteps(isBankTransfer: boolean, saasKind: ReturnType<typeof resolveSaasSuccessKind>): string[] {
  if (saasKind === 'renewal') {
    const steps = [saasSuccessNotice('renewal')]
    if (isBankTransfer) {
      steps.push('Havale/EFT ödemeniz onaylandığında üyelik süreniz otomatik uzatılır.')
    }
    return steps
  }
  if (saasKind === 'first_purchase') {
    return [
      saasSuccessNotice('first_purchase'),
      isBankTransfer
        ? 'Havale/EFT ödemeniz onaylandığında yazılım hesabınız oluşturulur ve giriş bilgileri e-posta ile gönderilir.'
        : 'Ödeme onayı sonrası yazılım hesabınız oluşturulur; giriş bilgileri e-posta ile iletilir.',
    ]
  }

  if (isBankTransfer) {
    return [
      'Siparişiniz oluşturuldu. Havale/EFT bilgileri e-posta ile paylaşıldı.',
      'Ödemeniz onaylandığında lisans ve indirme bilgileri e-posta adresinize iletilecek.',
      'Onay süreci banka transferine bağlı olarak kısa bir gecikme gösterebilir.',
    ]
  }

  return [
    'Sipariş onayınız ve fatura bilgileriniz e-posta adresinize gönderildi.',
    'Lisans veya indirme ürünlerinde teslimat birkaç dakika içinde tamamlanır.',
    CENTRAL_LICENSE_EMAIL_MESSAGE,
  ]
}

export function PaymentSuccessPage() {
  const ctx = usePaymentResultContext()
  const navigate = useNavigate()
  const { authed } = useCustomerSession()
  const queryClient = useQueryClient()
  const tracked = useRef(false)
  const cartCleared = useRef<string | null>(null)
  const ordersInvalidated = useRef<string | null>(null)

  const { orderNo, orderData, orderLoading } = ctx
  const saasKind = resolveSaasSuccessKind(orderNo || orderData?.orderNo || '', orderData)
  const isPaidLike =
    orderData?.status === 'PAID' || orderData?.status === 'PROCESSING'
  const isPending = orderData?.status === 'PENDING'
  const isBankTransfer =
    (orderData?.status === 'PENDING' || orderData?.status === 'PAID' || orderData?.status === 'PROCESSING') &&
    (orderData.paymentProvider === 'BANK_TRANSFER' ||
      (orderData.status === 'PENDING' && orderData.paymentStatusLabel.toLowerCase().includes('havale')))

  usePageMeta({
    title: orderNo ? `Ödeme başarılı — ${orderNo}` : 'Ödeme başarılı',
    description: 'Ödemeniz alındı. Sipariş ve teslimat bilgileri e-posta ile iletilecek.',
  })

  useEffect(() => {
    if (tracked.current) return
    const value = ctx.amount ?? orderData?.orderTotal
    const resolvedOrderNo = orderData?.orderNo || orderNo
    if (!resolvedOrderNo && value == null) return
    tracked.current = true
    trackPurchase({
      orderNo: resolvedOrderNo || undefined,
      value: value ?? undefined,
      currency: ctx.currency,
    })
  }, [ctx.amount, ctx.currency, orderData, orderNo])

  useEffect(() => {
    if (!orderNo || !isPaidLike) return
    if (cartCleared.current === orderNo) return
    cartCleared.current = orderNo
    clearCart()
  }, [orderNo, isPaidLike])

  useEffect(() => {
    if (!authed || !orderNo || !isPaidLike) return
    if (ordersInvalidated.current === orderNo) return
    ordersInvalidated.current = orderNo
    void queryClient.invalidateQueries({ queryKey: ['customer', 'orders'] })
    void queryClient.invalidateQueries({ queryKey: ['customer', 'licenses'] })
  }, [authed, isPaidLike, orderNo, queryClient])

  useEffect(() => {
    if (!orderNo || !orderData || !isPaidLike) return
    const resolvedNo = orderData.orderNo || orderNo
    try {
      const renewOrder = sessionStorage.getItem(SAAS_RENEW_ORDER_KEY)
      if (renewOrder && renewOrder === resolvedNo) {
        sessionStorage.removeItem(SAAS_RENEW_ORDER_KEY)
        navigate('/hesabim/uyelikler?renewSuccess=1', { replace: true })
      }
    } catch {
      /* ignore */
    }
  }, [orderData, orderNo, isPaidLike, navigate])

  if (orderNo && orderLoading && !orderData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gradient-to-b from-emerald-50/80 to-white px-4 py-16">
        <LoadingState label="Ödeme sonucu doğrulanıyor…" />
      </div>
    )
  }

  const title = isPending
    ? 'Siparişiniz alındı'
    : 'Ödemeniz başarıyla alındı'

  const description = isPending ? (
    <>
      Ödemeniz henüz onay bekliyor olabilir. Sipariş numaranızı not alın; onay sonrası e-posta ile bilgilendirileceksiniz.
    </>
  ) : (
    <>
      Teşekkür ederiz. İşleminiz güvenle tamamlandı; sipariş detayları ve sonraki adımlar aşağıda.
      {!orderNo && !orderData ? (
        <span className="mt-2 block text-sm text-slate-500">
          Sipariş numaranız e-posta ile iletildi. Gelen kutunuzu ve spam klasörünü kontrol edin.
        </span>
      ) : null}
    </>
  )

  return (
    <PaymentResultLayout
      tone="success"
      icon={CheckCircle2}
      eyebrow="Ödeme tamamlandı"
      title={title}
      description={description}
      trustCards={[
        {
          icon: ShieldCheck,
          title: 'Güvenli ödeme',
          description: 'PayTR altyapısı ile şifreli ve güvenli ödeme işlemi tamamlandı.',
        },
        {
          icon: KeyRound,
          title: 'Lisans & teslimat',
          description: 'Dijital ürünlerde lisans ve indirme bilgileri otomatik olarak hazırlanır.',
        },
        {
          icon: Headphones,
          title: 'Destek ekibi',
          description: 'Sorularınız için iletişim kanallarımızdan bize ulaşabilirsiniz.',
        },
      ]}
      actions={buildSuccessActions(orderNo || orderData?.orderNo || '', authed)}
    >
      <PaymentOrderSummary ctx={ctx} />

      <PaymentResultPanel title="Sonraki adımlar" className="mt-4">
        <PaymentResultSteps items={buildNextSteps(Boolean(isBankTransfer), saasKind)} />
      </PaymentResultPanel>

      {saasKind ? (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900">
          {saasSuccessNotice(saasKind)}
        </p>
      ) : null}

      {isPaidLike && orderData?.paidAt ? (
        <p className="mt-4 text-center text-xs text-slate-500">
          Ödeme zamanı: {new Date(orderData.paidAt).toLocaleString('tr-TR')}
        </p>
      ) : null}

      {orderData?.status === 'FAILED' || orderData?.status === 'CANCELLED' ? (
        <p className="mt-4 text-center text-sm text-amber-800">
          Bu sipariş için ödeme tamamlanmamış görünüyor.{' '}
          <Link
            to={`/odeme/basarisiz${orderData.orderNo ? `/${encodeURIComponent(orderData.orderNo)}` : ''}`}
            className="font-semibold text-emerald-700 hover:underline"
          >
            Başarısız ödeme sayfasına gidin
          </Link>
        </p>
      ) : null}
    </PaymentResultLayout>
  )
}
