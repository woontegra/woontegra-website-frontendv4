import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { PublicBlogPost } from '@/types/blog'
import { pickBlogCoverUrl } from '@/lib/publicContentImages'
import { cn } from '@/lib/cn'

const GRADIENTS = [
  'from-emerald-600 via-emerald-700 to-teal-800',
  'from-slate-700 via-slate-800 to-slate-900',
  'from-violet-600 via-purple-700 to-indigo-800',
  'from-sky-600 via-blue-700 to-cyan-800',
  'from-amber-600 via-orange-600 to-rose-700',
] as const

function pickBlogCardGradient(seed: string): (typeof GRADIENTS)[number] {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i)) % GRADIENTS.length
  }
  return GRADIENTS[hash] ?? GRADIENTS[0]
}

function coverAspectClass(compact: boolean): string {
  return compact ? 'aspect-[16/9]' : 'aspect-[16/10]'
}

type Props = {
  post: PublicBlogPost
  compact?: boolean
}

export function BlogCardCover({ post, compact = false }: Props) {
  const coverUrl = pickBlogCoverUrl(post)
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(coverUrl) && !imageFailed
  const initial = (post.title.trim().charAt(0) || 'W').toLocaleUpperCase('tr-TR')
  const gradient = pickBlogCardGradient(post.id || post.slug || post.title)

  useEffect(() => {
    setImageFailed(false)
  }, [coverUrl])

  return (
    <Link to={`/blog/${post.slug}`} className="block shrink-0 overflow-hidden">
      <div className={cn('relative w-full overflow-hidden bg-slate-100', coverAspectClass(compact))}>
        {showImage ? (
          <img
            src={coverUrl}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br p-4 text-white',
              gradient,
            )}
            aria-hidden
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="relative flex flex-col items-center gap-2 text-center">
              {post.category?.name ? (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                  {post.category.name}
                </span>
              ) : (
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">
                  Woontegra Blog
                </span>
              )}
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold backdrop-blur-sm">
                {initial}
              </span>
              <BookOpen className="h-5 w-5 text-white/70" strokeWidth={1.75} />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}

export { coverAspectClass }
