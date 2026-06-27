import {
  defaultFooterGroupsBundle,
  FOOTER_GROUPS_KEY,
  mergeFooterGroups,
  type FooterGroupsBundle,
} from '@/data/footerGroupsContent'
import { pageContentService } from '@/services/pageContentService'

export const footerGroupsService = {
  async get(): Promise<FooterGroupsBundle> {
    const raw = await pageContentService.getRawByKey(FOOTER_GROUPS_KEY)
    return mergeFooterGroups(defaultFooterGroupsBundle, raw as Partial<FooterGroupsBundle> | null)
  },
}
