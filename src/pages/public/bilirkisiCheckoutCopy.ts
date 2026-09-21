export type BilirkisiPurchaseContext = 'DEMO_CONVERSION' | 'LICENSE_RENEWAL'
export type BilirkisiCheckoutKind = 'loading' | 'demo' | 'renewal' | 'purchase'

export type BilirkisiCheckoutCopy = {
  kind: BilirkisiCheckoutKind
  title: string | null
  subtitle: string | null
  sessionTitle: string | null
  guestTitle: string | null
  guestBody: string | null
  packageTitle: string
  packageNote: string | null
}

const DEMO_TITLE = 'Profesyonel aboneliğe geçin'
const DEMO_SUBTITLE_BASE =
  'Ödeme sonrası mevcut Bilirkişi Hesap hesabınız profesyonel aboneliğe dönüştürülür. Yeni hesap oluşturulmaz.'
const DEMO_SUBTITLE_REMAINING = ' Kalan demo süreniz satın aldığınız abonelik süresine eklenir.'
const DEMO_SESSION_TITLE = 'Abonelik satın alma işlemi'
const DEMO_GUEST_TITLE = 'Satın alma işlemine devam etmek için Woontegra hesabınıza giriş yapın'
const DEMO_GUEST_BODY = 'Satın aldığınız abonelik mevcut Bilirkişi Hesap hesabınıza tanımlanır.'
const DEMO_PACKAGE_TITLE = 'Abonelik paketi'
const DEMO_PACKAGE_NOTE_ACTIVE = 'Satın aldığınız süreye kalan demo günleriniz eklenir.'
const DEMO_PACKAGE_NOTE_EXPIRED = 'Aboneliğiniz ödeme onayından sonra başlatılır.'

export function isLicenseStillActive(endsAt: string | null | undefined, now = Date.now()): boolean {
  if (!endsAt) return false
  const t = new Date(endsAt).getTime()
  if (Number.isNaN(t)) return false
  return t > now
}

function packageLooksLikeDemo(raw: unknown): boolean {
  const pkg = String(raw || '')
    .trim()
    .toLowerCase()
  return pkg === 'demo' || pkg.startsWith('demo')
}

export function parsePurchaseContext(data: Record<string, unknown>): BilirkisiPurchaseContext {
  const nested =
    data.data && typeof data.data === 'object' && !Array.isArray(data.data)
      ? (data.data as Record<string, unknown>)
      : null
  const ctx = String(data.purchaseContext || nested?.purchaseContext || '')
    .trim()
    .toUpperCase()
  if (ctx === 'DEMO_CONVERSION') return 'DEMO_CONVERSION'
  if (
    packageLooksLikeDemo(data.currentPackage) ||
    packageLooksLikeDemo(data.licenseType) ||
    packageLooksLikeDemo(nested?.currentPackage) ||
    packageLooksLikeDemo(nested?.licenseType)
  ) {
    return 'DEMO_CONVERSION'
  }
  return 'LICENSE_RENEWAL'
}

export function resolveBilirkisiCheckoutKind(input: {
  hasRenewToken: boolean
  purchaseContext: BilirkisiPurchaseContext | null
  quoteFailed?: boolean
}): BilirkisiCheckoutKind {
  if (input.hasRenewToken && !input.quoteFailed && !input.purchaseContext) return 'loading'
  if (input.purchaseContext === 'DEMO_CONVERSION') return 'demo'
  if (input.hasRenewToken && input.purchaseContext === 'LICENSE_RENEWAL') return 'renewal'
  return 'purchase'
}

export function bilirkisiCheckoutCopy(
  kind: BilirkisiCheckoutKind,
  input: { demoStillActive?: boolean; isDevUi?: boolean } = {},
): BilirkisiCheckoutCopy {
  if (kind === 'loading') {
    return {
      kind,
      title: null,
      subtitle: null,
      sessionTitle: null,
      guestTitle: null,
      guestBody: null,
      packageTitle: DEMO_PACKAGE_TITLE,
      packageNote: null,
    }
  }

  if (kind === 'demo') {
    const demoStillActive = Boolean(input.demoStillActive)
    return {
      kind,
      title: DEMO_TITLE,
      subtitle: `${DEMO_SUBTITLE_BASE}${demoStillActive ? DEMO_SUBTITLE_REMAINING : ''}`,
      sessionTitle: DEMO_SESSION_TITLE,
      guestTitle: DEMO_GUEST_TITLE,
      guestBody: DEMO_GUEST_BODY,
      packageTitle: DEMO_PACKAGE_TITLE,
      packageNote: demoStillActive ? DEMO_PACKAGE_NOTE_ACTIVE : DEMO_PACKAGE_NOTE_EXPIRED,
    }
  }

  if (kind === 'renewal') {
    return {
      kind,
      title: 'Aboneliğinizi Uzatın',
      subtitle: 'Ödeme sonrası mevcut lisansınız uzatılır; yeni hesap veya bağımsız lisans oluşturulmaz.',
      sessionTitle: 'Yenileme oturumu',
      guestTitle: 'Aboneliğinizi uzatmak için hesabınıza giriş yapın',
      guestBody:
        'Ödeme Woontegra hesabınız üzerinden alınır; Bilirkişi Hesap lisansınız aynı kullanıcıda uzatılır.',
      packageTitle: 'Uzatma paketi',
      packageNote: 'Seçtiğiniz süre, mevcut lisans bitiş tarihine eklenir.',
    }
  }

  return {
    kind,
    title: 'Satın al',
    subtitle: input.isDevUi
      ? 'Fiyat Bilirkişi Hesap satış motorundan gelir. Ödeme local ortamda dry-run ile çalışır.'
      : 'Abonelik paketini seçin, fatura bilgilerinizi tamamlayın ve ödemeye geçin.',
    sessionTitle: null,
    guestTitle: 'Satın almaya devam etmek için hesabınıza giriş yapın',
    guestBody: 'Siparişiniz ve lisans bilgileriniz Woontegra hesabınızla ilişkilendirilecektir.',
    packageTitle: DEMO_PACKAGE_TITLE,
    packageNote: 'Aylık ve yıllık birbirinden bağımsız iki pakettir.',
  }
}
