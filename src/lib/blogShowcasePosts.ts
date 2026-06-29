import type { BlogShowcaseBlock } from '@/builder/types'
import type { PublicBlogPost } from '@/types/blog'

function sortByNewest(posts: PublicBlogPost[]): PublicBlogPost[] {
  return [...posts].sort((a, b) => {
    const da = new Date(a.publishedAt || a.createdAt).getTime()
    const db = new Date(b.publishedAt || b.createdAt).getTime()
    return db - da
  })
}

export function pickBlogShowcasePosts(
  posts: PublicBlogPost[],
  settings: BlogShowcaseBlock['settings'],
): PublicBlogPost[] {
  const limit = Math.min(Math.max(settings.limit ?? 3, 1), 12)
  const published = posts.filter((p) => p.status === 'published')

  if (settings.source === 'manual') {
    const ids = settings.manualPostIds ?? []
    const byId = new Map(published.map((p) => [p.id, p]))
    return ids.map((id) => byId.get(id)).filter((p): p is PublicBlogPost => Boolean(p)).slice(0, limit)
  }

  let filtered = published

  if (settings.source === 'category' && settings.categoryId?.trim()) {
    const key = settings.categoryId.trim().toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.category?.id === settings.categoryId ||
        p.category?.slug?.toLowerCase() === key ||
        p.category?.name?.toLowerCase() === key,
    )
  }

  if (settings.source === 'tag' && settings.tag?.trim()) {
    const tag = settings.tag.trim().toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(tag) ||
        p.excerpt.toLowerCase().includes(tag) ||
        p.category?.name?.toLowerCase().includes(tag) ||
        p.category?.slug?.toLowerCase().includes(tag),
    )
  }

  return sortByNewest(filtered).slice(0, limit)
}

export function blogCategoriesFromPosts(posts: PublicBlogPost[]): { id: string; label: string }[] {
  const map = new Map<string, string>()
  for (const post of posts) {
    if (!post.category?.id) continue
    map.set(post.category.id, post.category.name || post.category.slug)
  }
  return [...map.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'tr'))
}
