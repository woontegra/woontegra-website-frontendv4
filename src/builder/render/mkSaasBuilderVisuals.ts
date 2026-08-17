import type { CardGridBlock, CtaBlock, HeroBlock } from '@/builder/types'

export const MK_SAAS_PROBLEM_PILLS = [
  'Tek güncel kayıt',
  'Daha az unutulan tahsilat',
  'Müvekkile hızlı hesap verme',
] as const

export function isMkSaasHero(hero: HeroBlock): boolean {
  return (
    hero.style.customClass?.includes('mk-saas-hero') === true ||
    (hero.settings.showProductPrice === true && hero.settings.layout === 'split')
  )
}

export function isMkSaasProblemBand(block: CtaBlock): boolean {
  return (
    block.style.customClass?.includes('mk-saas-problem-band') === true ||
    block.settings.variant === 'mk-problem-band'
  )
}

export function isMkSaasBenefitsGrid(block: CardGridBlock): boolean {
  return (
    block.settings.variant === 'mk-benefit' ||
    block.style.customClass?.includes('mk-saas-benefits') === true ||
    block.title?.trim() === 'Büronuzda ne değişecek?'
  )
}
