export const SAAS_RENEWAL_PERIODS = ['1_MONTHS', '3_MONTHS', '6_MONTHS', '12_MONTHS'] as const

export type SaasRenewalPeriod = (typeof SAAS_RENEWAL_PERIODS)[number]

export function renewalPeriodLabel(period: SaasRenewalPeriod): string {
  switch (period) {
    case '1_MONTHS':
      return '1 Ay'
    case '3_MONTHS':
      return '3 Ay'
    case '6_MONTHS':
      return '6 Ay'
    case '12_MONTHS':
      return '12 Ay'
    default:
      return period
  }
}

export const DEFAULT_SAAS_RENEWAL_PERIOD: SaasRenewalPeriod = '12_MONTHS'
