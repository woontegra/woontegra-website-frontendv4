import { GRADIENT_OPTIONS, ICON_OPTIONS } from '@/lib/iconRegistry'

export const SOLUTION_CARDS_KEY = 'solutionCards'
export const SOLUTION_BENEFIT_CARDS_KEY = 'solutionBenefitCards'

/** Kart id → kanonik detay sayfası — DB'deki eski /iletisim linklerini düzeltir */
export const CANONICAL_SOLUTION_CARD_HREF: Record<string, string> = {
  ecom: '/cozumler/e-ticaret-altyapisi',
  market: '/cozumler/pazaryeri-entegrasyonu',
  order: '/cozumler/siparis-yonetimi',
  stock: '/cozumler/stok-fiyat-yonetimi',
  ops: '/cozumler/dijital-operasyon',
  custom: '/cozumler/ozel-yazilim-surecleri',
}

export type SolutionCardConfig = {
  id: string
  title: string
  description: string
  icon: string
  href: string
  gradient: string
  order: number
  enabled: boolean
}

export type SolutionBenefitCardConfig = {
  id: string
  title: string
  description: string
  icon: string
  order: number
  enabled: boolean
}

export type SolutionCardsBundle = { cards: SolutionCardConfig[] }
export type SolutionBenefitCardsBundle = { cards: SolutionBenefitCardConfig[] }

function normalizeSolutionCard(card: SolutionCardConfig, index: number): SolutionCardConfig {
  const icon = ICON_OPTIONS.includes(card.icon as (typeof ICON_OPTIONS)[number]) ? card.icon : 'Boxes'
  const gradient = GRADIENT_OPTIONS.includes(card.gradient as (typeof GRADIENT_OPTIONS)[number])
    ? card.gradient
    : GRADIENT_OPTIONS[index % GRADIENT_OPTIONS.length]
  const rawHref = card.href?.trim() || ''

  return {
    id: card.id || `sol-${index}`,
    title: card.title?.trim() || 'Başlıksız',
    description: card.description?.trim() || '',
    icon,
    href: CANONICAL_SOLUTION_CARD_HREF[card.id] ?? (rawHref && rawHref !== '/iletisim' ? rawHref : '/cozumler'),
    gradient,
    order: typeof card.order === 'number' ? card.order : index,
    enabled: card.enabled !== false,
  }
}

function normalizeBenefitCard(card: SolutionBenefitCardConfig, index: number): SolutionBenefitCardConfig {
  const icon = ICON_OPTIONS.includes(card.icon as (typeof ICON_OPTIONS)[number]) ? card.icon : 'LayoutDashboard'
  return {
    id: card.id || `ben-${index}`,
    title: card.title?.trim() || 'Başlıksız',
    description: card.description?.trim() || '',
    icon,
    order: typeof card.order === 'number' ? card.order : index,
    enabled: card.enabled !== false,
  }
}

export function mergeSolutionCards(
  defaults: SolutionCardsBundle,
  partial?: Partial<SolutionCardsBundle> | null,
): SolutionCardsBundle {
  if (!partial?.cards?.length) return { cards: defaults.cards.map((c, i) => normalizeSolutionCard(c, i)) }
  return { cards: partial.cards.map((card, i) => normalizeSolutionCard(card, i)) }
}

export function mergeSolutionBenefitCards(
  defaults: SolutionBenefitCardsBundle,
  partial?: Partial<SolutionBenefitCardsBundle> | null,
): SolutionBenefitCardsBundle {
  if (!partial?.cards?.length) return { cards: defaults.cards.map((c, i) => normalizeBenefitCard(c, i)) }
  return { cards: partial.cards.map((card, i) => normalizeBenefitCard(card, i)) }
}

export const defaultSolutionCardsBundle: SolutionCardsBundle = {
  cards: [
    {
      id: 'ecom',
      title: 'E-ticaret Altyapısı',
      description: 'Ürün, sepet, ödeme ve sipariş süreçlerini tek panelde yönetilebilir e-ticaret altyapıları.',
      icon: 'ShoppingCart',
      href: CANONICAL_SOLUTION_CARD_HREF.ecom,
      gradient: 'from-emerald-500 to-teal-500',
      order: 0,
      enabled: true,
    },
    {
      id: 'market',
      title: 'Pazaryeri Entegrasyonu',
      description: 'Trendyol ve benzeri kanallarda ürün, sipariş, fiyat ve stok senkronizasyonu.',
      icon: 'Package',
      href: CANONICAL_SOLUTION_CARD_HREF.market,
      gradient: 'from-blue-500 to-cyan-500',
      order: 1,
      enabled: true,
    },
    {
      id: 'order',
      title: 'Sipariş Yönetimi',
      description: 'Web, pazaryeri ve manuel satışlardan gelen siparişleri tek merkezde izleyin.',
      icon: 'Truck',
      href: CANONICAL_SOLUTION_CARD_HREF.order,
      gradient: 'from-violet-500 to-purple-500',
      order: 2,
      enabled: true,
    },
    {
      id: 'stock',
      title: 'Stok / Fiyat Yönetimi',
      description: 'Stok, kampanya fiyatları ve pazaryeri fiyat stratejilerini merkezi yönetin.',
      icon: 'RefreshCw',
      href: CANONICAL_SOLUTION_CARD_HREF.stock,
      gradient: 'from-orange-500 to-red-500',
      order: 3,
      enabled: true,
    },
    {
      id: 'ops',
      title: 'Dijital Operasyon',
      description: 'Satış sonrası, müşteri, ödeme, lisans ve raporlama süreçlerini dijitalleştirin.',
      icon: 'Workflow',
      href: CANONICAL_SOLUTION_CARD_HREF.ops,
      gradient: 'from-pink-500 to-rose-500',
      order: 4,
      enabled: true,
    },
    {
      id: 'custom',
      title: 'Özel Yazılım Süreçleri',
      description: 'İş akışınıza özel panel, SaaS, entegrasyon ve otomasyon sistemleri.',
      icon: 'Boxes',
      href: CANONICAL_SOLUTION_CARD_HREF.custom,
      gradient: 'from-slate-700 to-slate-900',
      order: 5,
      enabled: true,
    },
  ],
}

export const defaultSolutionBenefitCardsBundle: SolutionBenefitCardsBundle = {
  cards: [
    { id: 'eff', title: 'Operasyonel Verimlilik', description: 'Dağınık süreçleri tek panelde toplayarak zaman kazandırır.', icon: 'LayoutDashboard', order: 0, enabled: true },
    { id: 'sales', title: 'Satış Odaklı Mimari', description: 'Teknik altyapıyı ticari hedeflerle uyumlu şekilde kurgular.', icon: 'ShoppingCart', order: 1, enabled: true },
    { id: 'growth', title: 'Sürdürülebilir Büyüme', description: 'Sistemler büyüdükçe yönetilebilir ve ölçeklenebilir kalır.', icon: 'RefreshCw', order: 2, enabled: true },
  ],
}

export function getActiveSolutionCards(bundle: SolutionCardsBundle): SolutionCardConfig[] {
  return bundle.cards.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}

export function getActiveSolutionBenefitCards(bundle: SolutionBenefitCardsBundle): SolutionBenefitCardConfig[] {
  return bundle.cards.filter((c) => c.enabled).sort((a, b) => a.order - b.order)
}
