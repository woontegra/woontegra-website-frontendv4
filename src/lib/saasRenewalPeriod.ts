/** Müvekkil Kasa SaaS üyelik uzatması yalnızca yıllık yapılır. */
export const ANNUAL_SAAS_RENEWAL_PERIOD = '12_MONTHS' as const

export type SaasRenewalPeriod = typeof ANNUAL_SAAS_RENEWAL_PERIOD

export const DEFAULT_SAAS_RENEWAL_PERIOD: SaasRenewalPeriod = ANNUAL_SAAS_RENEWAL_PERIOD

export function renewalPeriodLabel(_period: SaasRenewalPeriod = ANNUAL_SAAS_RENEWAL_PERIOD): string {
  return '1 Yıl'
}
