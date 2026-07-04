import { SOLUTION_DETAIL_BY_SLUG, type SolutionDetailContent } from '@/data/solutionDetailContent'

export type { SolutionDetailContent }

export const SOLUTION_PAGE_CONTENT_KEY = 'solutionPages'

export const SOLUTION_CATALOG: Array<Pick<SolutionDetailContent, 'slug' | 'title' | 'description' | 'enabled' | 'seoTitle' | 'seoDescription'>> =
  Object.values(SOLUTION_DETAIL_BY_SLUG).map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description,
    enabled: s.enabled,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
  }))

export function getSolutionBySlug(slug: string): SolutionDetailContent | undefined {
  return SOLUTION_DETAIL_BY_SLUG[slug]
}
