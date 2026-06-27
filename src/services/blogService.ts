import { publicApi } from '@/api/client'
import type { ApiSuccess } from '@/types/api'
import { unwrapApiData } from '@/types/api'
import type { PublicBlogPost } from '@/types/blog'
import { normalizeBlogList, normalizeBlogPost } from '@/types/blog'

export const blogService = {
  async list(): Promise<PublicBlogPost[]> {
    const res = await publicApi.get<ApiSuccess<PublicBlogPost[]>>('/blog/posts')
    return normalizeBlogList(unwrapApiData(res.data, 'blog.list'))
  },

  async getBySlug(slug: string): Promise<PublicBlogPost> {
    const res = await publicApi.get<ApiSuccess<PublicBlogPost>>(`/blog/posts/${encodeURIComponent(slug)}`)
    const row = normalizeBlogPost(unwrapApiData(res.data, 'blog.getBySlug'))
    if (!row || row.status !== 'published') throw new Error('Yazı bulunamadı')
    return row
  },
}
