import { LegalCmsPage } from '@/components/legal/LegalCmsPage'
import {
  defaultLegalAcikRizaPage,
  defaultLegalCookiePage,
  defaultLegalKvkkPage,
  defaultLegalPrivacyPage,
  defaultLegalRefundPage,
  defaultLegalTermsPage,
} from '@/data/legalPageDefaults'
import {
  LEGAL_CONSENT_PAGE_KEY,
  LEGAL_COOKIE_PAGE_KEY,
  LEGAL_KVKK_PAGE_KEY,
  LEGAL_PRIVACY_PAGE_KEY,
  LEGAL_TERMS_PAGE_KEY,
} from '@/types/legalPageContent'

export function KvkkPage() {
  return <LegalCmsPage pageKey={LEGAL_KVKK_PAGE_KEY} defaults={defaultLegalKvkkPage} />
}

export function PrivacyPage() {
  return <LegalCmsPage pageKey={LEGAL_PRIVACY_PAGE_KEY} defaults={defaultLegalPrivacyPage} />
}

export function CookiePolicyPage() {
  return <LegalCmsPage pageKey={LEGAL_COOKIE_PAGE_KEY} defaults={defaultLegalCookiePage} loadCookies />
}

export function RefundPolicyPage() {
  return <LegalCmsPage pageKey="legalRefundPage" defaults={defaultLegalRefundPage} />
}

export function AcikRizaMetniPage() {
  return (
    <LegalCmsPage
      pageKey={LEGAL_CONSENT_PAGE_KEY}
      defaults={defaultLegalAcikRizaPage}
      showCompanyRepresentative={false}
    />
  )
}

export function KullanimSartlariPage() {
  return (
    <LegalCmsPage pageKey={LEGAL_TERMS_PAGE_KEY} defaults={defaultLegalTermsPage} showCompanyRepresentative={false} />
  )
}
