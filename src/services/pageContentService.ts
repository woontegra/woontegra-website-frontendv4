import { publicApi, adminApi, getErrorMessage } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import {
  HOME_PAGE_KEY,
  normalizeContactContent,
  normalizeHomePageContent,
  PAGE_CONTENT_KEYS,
  mergeMarketingPageContent,
  type ContactPageContent,
  type HomePageContent,
  type MarketingPageContent,
} from '@/types/pageContent'
import { normalizeAboutContent, type AboutPageContent } from '@/types/aboutPageContent'

export const pageContentService = {
  async getRawByKey(key: string): Promise<Record<string, unknown> | null> {
    const res = await publicApi.get<ApiSuccess<Record<string, unknown> | null>>(`/page-content/${key}`)
    const data = unwrapApiData<Record<string, unknown> | null>(res.data, `page-content.${key}`)
    if (data == null) return null
    if (typeof data === 'object' && !Array.isArray(data)) return data
    return null
  },

  async getAbout(): Promise<AboutPageContent> {
    const raw = await this.getRawByKey(PAGE_CONTENT_KEYS.about)
    return normalizeAboutContent(raw)
  },

  async getContact(): Promise<ContactPageContent> {
    const raw = await this.getRawByKey(PAGE_CONTENT_KEYS.contact)
    return normalizeContactContent(raw)
  },

  async getHome(): Promise<HomePageContent> {
    const raw = await this.getRawByKey(HOME_PAGE_KEY)
    return normalizeHomePageContent(raw)
  },

  async getMarketingPage(key: string, defaults: MarketingPageContent): Promise<MarketingPageContent> {
    const raw = await this.getRawByKey(key)
    return mergeMarketingPageContent(defaults, raw)
  },

  async updateByKey(key: string, content: Record<string, unknown>): Promise<Record<string, unknown>> {
    const res = await adminApi.put<ApiSuccess<Record<string, unknown>>>(`/page-content/${key}`, { content })
    const data = unwrapApiData<Record<string, unknown>>(res.data, `page-content.${key}.update`)
    if (data && typeof data === 'object' && !Array.isArray(data)) return data
    return content
  },
}

export { getErrorMessage }
