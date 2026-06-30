import type { BuilderPageDefinition } from '@/builder/pages/builderPageRegistry'
import { pageContentService } from '@/services/pageContentService'
import { productsService } from '@/services/productsService'
import { SERVICE_CARDS_KEY } from '@/data/serviceCardsContent'
import {
  SOLUTION_BENEFIT_CARDS_KEY,
  SOLUTION_CARDS_KEY,
} from '@/data/solutionCardsContent'

/** Parity dönüşümü için ilişkili CMS anahtarlarını birleştirir. */
export async function enrichParityRaw(
  def: BuilderPageDefinition,
  primary: Record<string, unknown> | null,
): Promise<Record<string, unknown> | null> {
  const base = primary ? { ...primary } : {}

  if (def.key === 'services') {
    try {
      base[`__${SERVICE_CARDS_KEY}`] = await pageContentService.getRawByKey(SERVICE_CARDS_KEY)
    } catch {
      /* defaults kullanılır */
    }
  }

  if (def.key === 'solutions') {
    try {
      base[`__${SOLUTION_CARDS_KEY}`] = await pageContentService.getRawByKey(SOLUTION_CARDS_KEY)
      base[`__${SOLUTION_BENEFIT_CARDS_KEY}`] = await pageContentService.getRawByKey(SOLUTION_BENEFIT_CARDS_KEY)
    } catch {
      /* defaults kullanılır */
    }
  }

  if (def.kind === 'product-detail' && def.slug?.trim()) {
    try {
      base.__productDetail = await productsService.getBySlug(def.slug.trim())
    } catch {
      /* seed fallback — createProductDetailEditableTemplate */
    }
  }

  return Object.keys(base).length > 0 ? base : null
}
