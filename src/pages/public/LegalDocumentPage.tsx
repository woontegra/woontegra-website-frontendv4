import { Navigate, useParams } from 'react-router-dom'
import type { ComponentType } from 'react'
import { LegalDocumentView } from '@/components/public/LegalDocumentView'
import { NotFoundPage } from '@/pages/public/NotFoundPage'
import {
  AcikRizaMetniPage,
  CookiePolicyPage,
  KullanimSartlariPage,
  KvkkPage,
  PrivacyPage,
  RefundPolicyPage,
} from '@/pages/public/LegalPublicPages'
import {
  isLegalPublicSlug,
  legalSlugToTitle,
  legalSlugToType,
  legalTypeToPublicHref,
  LEGAL_CMS_ONLY_SLUGS,
} from '@/lib/legalSlugs'
import {
  ALL_LEGAL_DOC_TYPES,
  LEGAL_CHECKOUT_DOC,
  LEGAL_TYPE_LABELS,
  type LegalDocType,
} from '@/types/legalDocuments'

const CMS_BY_SLUG: Partial<Record<string, ComponentType>> = {
  'kvkk-aydinlatma-metni': KvkkPage,
  'gizlilik-politikasi': PrivacyPage,
  'kullanim-sartlari': KullanimSartlariPage,
  'acik-riza-metni': AcikRizaMetniPage,
  'pazarlama-acik-riza-metni': AcikRizaMetniPage,
  'cerez-politikasi': CookiePolicyPage,
  'iade-iptal-kosullari': RefundPolicyPage,
}

function renderBySlug(slug: string) {
  if (!isLegalPublicSlug(slug)) return <NotFoundPage />

  const CmsPage = CMS_BY_SLUG[slug]
  if (CmsPage) return <CmsPage />

  const checkoutCfg = LEGAL_CHECKOUT_DOC[slug as keyof typeof LEGAL_CHECKOUT_DOC]
  if (checkoutCfg) {
    return (
      <LegalDocumentView
        docType={checkoutCfg.type}
        title={checkoutCfg.title}
        subtitle={checkoutCfg.subtitle}
        seoTitle={checkoutCfg.seoTitle}
        seoDescription={checkoutCfg.seoDescription}
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: checkoutCfg.title }]}
      />
    )
  }

  const docType = legalSlugToType(slug)
  if (docType) {
    const label = legalSlugToTitle(slug)
    return (
      <LegalDocumentView
        docType={docType}
        title={label}
        subtitle="Woontegra yasal belge metni"
        seoTitle={label}
        seoDescription={label}
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: label }]}
      />
    )
  }

  return <NotFoundPage />
}

/** /yasal/:slug — checkout slug'ları ve genel yasal slug'lar */
export function LegalDocumentPage() {
  const { slug = '' } = useParams()
  return renderBySlug(slug)
}

/** Tek slug route — `:slug` param ile (builder / dinamik) */
export function LegalSlugPage() {
  const { slug = '' } = useParams()
  return renderBySlug(slug)
}

export function MesafeliSatisSozlesmesiPage() {
  return renderBySlug('mesafeli-satis-sozlesmesi')
}

export function OnBilgilendirmeFormuPage() {
  return renderBySlug('on-bilgilendirme-formu')
}

/** /yasal-belge/:type — geriye uyumluluk; slug karşılığı varsa yönlendirilir */
export function LegalTypeDocumentPage() {
  const { type = '' } = useParams()

  const docType = ALL_LEGAL_DOC_TYPES.includes(type as LegalDocType) ? (type as LegalDocType) : null
  if (!docType) return <NotFoundPage />

  const target = legalTypeToPublicHref(docType)
  if (!target.startsWith('/yasal-belge/')) {
    return <Navigate to={target} replace />
  }

  const label = LEGAL_TYPE_LABELS[docType] ?? 'Yasal belge'

  return (
    <LegalDocumentView
      docType={docType}
      title={label}
      subtitle="Woontegra yasal belge metni"
      seoTitle={label}
      seoDescription={label}
      breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: label }]}
    />
  )
}

export function isLegalCmsSlug(slug: string): boolean {
  return isLegalPublicSlug(slug) && (LEGAL_CMS_ONLY_SLUGS.has(slug) || slug in CMS_BY_SLUG)
}
