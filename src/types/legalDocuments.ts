export type LegalDocType =
  | 'PRE_INFORMATION'
  | 'DISTANCE_SALES'
  | 'KVKK_CLARIFICATION'
  | 'EXPLICIT_CONSENT'
  | 'COMMERCIAL_ELECTRONIC_MESSAGE'
  | 'TERMS_OF_USE'
  | 'PRIVACY_POLICY'
  | 'SOFTWARE_LICENSE'
  | 'SAAS_SUBSCRIPTION'
  | 'DIGITAL_IMMEDIATE_DELIVERY_WAIVER'

export type PublicLegalDocument = {
  type: string
  title: string
  content: string
  version: number
}

export const ALL_LEGAL_DOC_TYPES: LegalDocType[] = [
  'PRE_INFORMATION',
  'DISTANCE_SALES',
  'KVKK_CLARIFICATION',
  'EXPLICIT_CONSENT',
  'COMMERCIAL_ELECTRONIC_MESSAGE',
  'TERMS_OF_USE',
  'PRIVACY_POLICY',
  'SOFTWARE_LICENSE',
  'SAAS_SUBSCRIPTION',
  'DIGITAL_IMMEDIATE_DELIVERY_WAIVER',
]

export const LEGAL_TYPE_LABELS: Record<LegalDocType, string> = {
  PRE_INFORMATION: 'Ön Bilgilendirme Formu',
  DISTANCE_SALES: 'Mesafeli Satış Sözleşmesi',
  KVKK_CLARIFICATION: 'KVKK Aydınlatma Metni',
  EXPLICIT_CONSENT: 'Açık Rıza Metni',
  COMMERCIAL_ELECTRONIC_MESSAGE: 'Elektronik Ticari İleti Bilgilendirme Metni',
  TERMS_OF_USE: 'Kullanım Koşulları',
  PRIVACY_POLICY: 'Gizlilik Politikası',
  SOFTWARE_LICENSE: 'Yazılım Lisans Sözleşmesi',
  SAAS_SUBSCRIPTION: 'SaaS Abonelik Sözleşmesi',
  DIGITAL_IMMEDIATE_DELIVERY_WAIVER: 'Dijital Teslimat İstisnası',
}

export const LEGAL_CHECKOUT_DOC: Record<
  string,
  { type: LegalDocType; title: string; subtitle: string; seoTitle: string; seoDescription: string }
> = {
  'on-bilgilendirme-formu': {
    type: 'PRE_INFORMATION',
    title: 'Ön Bilgilendirme Formu',
    subtitle: 'Satın alma öncesi ürün, satıcı ve ödeme bilgileri.',
    seoTitle: 'Ön Bilgilendirme Formu',
    seoDescription: 'Mesafeli satın alma öncesi yasal ön bilgilendirme metni.',
  },
  'mesafeli-satis-sozlesmesi': {
    type: 'DISTANCE_SALES',
    title: 'Mesafeli Satış Sözleşmesi',
    subtitle: 'Dijital ürün satışına ilişkin mesafeli satış sözleşmesi.',
    seoTitle: 'Mesafeli Satış Sözleşmesi',
    seoDescription: 'Mesafeli satış sözleşmesi ve tarafların hakları.',
  },
  'elektronik-ileti-bilgilendirme': {
    type: 'COMMERCIAL_ELECTRONIC_MESSAGE',
    title: 'Elektronik Ticari İleti Bilgilendirme Metni',
    subtitle: 'Kampanya ve duyurular için elektronik ileti iznine ilişkin bilgilendirme.',
    seoTitle: 'Elektronik Ticari İleti Bilgilendirmesi',
    seoDescription: 'Ticari elektronik ileti onayı ve geri çekme hakkı hakkında bilgilendirme.',
  },
  'pazarlama-acik-riza-metni': {
    type: 'EXPLICIT_CONSENT',
    title: 'Pazarlama Amaçlı Kişisel Veri İşleme Açık Rıza Metni',
    subtitle: 'Kişisel verilerinizin pazarlama amacıyla işlenmesine ilişkin açık rıza metni.',
    seoTitle: 'Pazarlama Açık Rıza Metni',
    seoDescription: 'Pazarlama ve kişiselleştirilmiş teklifler için açık rıza ve geri çekme.',
  },
}

export function isLegalCheckoutDocSlug(slug: string): slug is keyof typeof LEGAL_CHECKOUT_DOC {
  return slug in LEGAL_CHECKOUT_DOC
}

export function legalCheckoutPreviewVariables(): Record<string, string> {
  return {
    customerName: '—',
    customerEmail: '—',
    orderNo: 'Ödeme onayından sonra sipariş numaranız oluşturulur.',
    orderTotal: '—',
    currency: '₺',
    productList: '<p>Sipariş özetindeki ürünler ödeme adımında gösterilir.</p>',
  }
}

export function normalizePublicLegalDocument(raw: unknown): PublicLegalDocument | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const content = String(o.content ?? '')
  const title = String(o.title ?? 'Yasal metin')
  if (!content.trim() && !title.trim()) return null
  return {
    type: String(o.type ?? ''),
    title,
    content,
    version: Number(o.version) || 1,
  }
}
