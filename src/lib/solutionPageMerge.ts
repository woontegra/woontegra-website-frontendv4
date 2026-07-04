import type { SolutionDetailContent } from '@/data/solutionDetailContent'

export type SolutionPageOverrides = Partial<
  SolutionDetailContent & {
    enabled?: boolean
    seoTitle?: string
    seoDescription?: string
  }
>

function mergeHero(
  base: SolutionDetailContent['hero'],
  partial?: Partial<SolutionDetailContent['hero']>,
): SolutionDetailContent['hero'] {
  if (!partial) return base
  return {
    ...base,
    ...partial,
    eyebrow: partial.eyebrow?.trim() || base.eyebrow,
    title: partial.title?.trim() || base.title,
    description: partial.description?.trim() || base.description,
    image: partial.image?.trim() || base.image,
    imageAlt: partial.imageAlt?.trim() || base.imageAlt,
    primaryCta: partial.primaryCta?.text?.trim() ? partial.primaryCta : base.primaryCta,
    secondaryCta: partial.secondaryCta?.text?.trim() ? partial.secondaryCta : base.secondaryCta,
  }
}

export function mergeSolutionPage(base: SolutionDetailContent, partial: SolutionPageOverrides): SolutionDetailContent {
  return {
    ...base,
    title: partial.title?.trim() || base.title,
    description: partial.description?.trim() || base.description,
    enabled: partial.enabled ?? base.enabled,
    seoTitle: partial.seoTitle?.trim() || base.seoTitle,
    seoDescription: partial.seoDescription?.trim() || base.seoDescription,
    hero: mergeHero(base.hero, partial.hero),
    audience: partial.audience?.items?.length
      ? { ...base.audience, ...partial.audience, items: partial.audience.items }
      : base.audience,
    benefits: partial.benefits?.items?.length
      ? { ...base.benefits, ...partial.benefits, items: partial.benefits.items }
      : base.benefits,
    modules: partial.modules?.items?.length
      ? { ...base.modules, ...partial.modules, items: partial.modules.items }
      : base.modules,
    implementation: {
      ...base.implementation,
      ...(partial.implementation ?? {}),
      title: partial.implementation?.title?.trim() || base.implementation.title,
      description: partial.implementation?.description?.trim() || base.implementation.description,
      bullets: partial.implementation?.bullets?.length ? partial.implementation.bullets : base.implementation.bullets,
      flowSteps: partial.implementation?.flowSteps?.length
        ? partial.implementation.flowSteps
        : base.implementation.flowSteps,
    },
    related: partial.related?.links?.length
      ? { ...base.related, ...partial.related, links: partial.related.links }
      : base.related,
    cta: {
      ...base.cta,
      ...(partial.cta ?? {}),
      title: partial.cta?.title?.trim() || base.cta.title,
      description: partial.cta?.description?.trim() || base.cta.description,
      buttonText: partial.cta?.buttonText?.trim() || base.cta.buttonText,
      buttonTo: partial.cta?.buttonTo?.trim() || base.cta.buttonTo,
      secondaryButtonText: partial.cta?.secondaryButtonText?.trim() || base.cta.secondaryButtonText,
      secondaryButtonTo: partial.cta?.secondaryButtonTo?.trim() || base.cta.secondaryButtonTo,
    },
  }
}
