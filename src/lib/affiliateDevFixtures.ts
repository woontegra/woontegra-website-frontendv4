/**
 * Yalnızca Vite DEV ortamında çalışan sahte finans görünümü.
 * Production build’de import.meta.env.DEV=false → asla aktif olmaz; DB’ye yazmaz.
 */

import type {
  AffiliateCommissionsPayload,
  AffiliatePartnerFinancialSummary,
  AffiliatePayoutsPayload,
} from '@/types/affiliatePartner'

const STORAGE_KEY = 'wt_aff_dev_fixtures'

export function isAffiliateDevFixturesEnabled(): boolean {
  if (!import.meta.env.DEV) return false
  if (typeof window === 'undefined') return false
  try {
    if (new URLSearchParams(window.location.search).get('affDevFixtures') === '1') return true
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function enableAffiliateDevFixtures(): void {
  if (!import.meta.env.DEV) return
  window.localStorage.setItem(STORAGE_KEY, '1')
}

export function disableAffiliateDevFixtures(): void {
  if (!import.meta.env.DEV) return
  window.localStorage.removeItem(STORAGE_KEY)
}

/** Sahte özet: 1 satış, 20.000 TL tahsilat, %30 komisyon (KDV %20 varsayımı). */
export function getAffiliateDevFixtureSummary(): AffiliatePartnerFinancialSummary {
  const gross = 2_000_000
  const base = 1_666_667
  const earned = 500_000
  return {
    saleCount: 1,
    totalGrossPaidAmountKurus: gross,
    totalCommissionBaseAmountKurus: base,
    lifetimeEarnedCommissionKurus: earned,
    paidCommissionKurus: 0,
    pendingCommissionKurus: earned,
  }
}

export function getAffiliateDevFixtureCommissions(): AffiliateCommissionsPayload {
  const summary = getAffiliateDevFixtureSummary()
  return {
    summary,
    items: [
      {
        id: 'dev-fixture-commission-1',
        saleType: 'FIRST_SALE',
        productType: 'DOWNLOAD',
        productName: 'Müvekkil Kasa Defteri Masaüstü (DEV sahte)',
        grossPaidAmountKurus: summary.totalGrossPaidAmountKurus,
        commissionBaseAmountKurus: summary.totalCommissionBaseAmountKurus,
        commissionRateSnapshot: 30,
        effectiveCustomerDiscountRateSnapshot: 5,
        commissionAmountKurus: summary.lifetimeEarnedCommissionKurus,
        paidAmountKurus: 0,
        remainingAmountKurus: summary.lifetimeEarnedCommissionKurus,
        status: 'EARNED',
        createdAt: new Date().toISOString(),
        saleRef: 'SAT-DEV001',
      },
    ],
    pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
  }
}

export function getAffiliateDevFixturePayouts(): AffiliatePayoutsPayload {
  return {
    items: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  }
}
