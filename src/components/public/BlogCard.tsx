import { Link } from 'react-router-dom'

import type { PublicBlogPost } from '@/types/blog'

import { formatBlogDate } from '@/types/blog'

import { MediaImage } from '@/media/components/MediaImage'

import { pickBlogCoverUrl } from '@/lib/publicContentImages'

import { estimateReadingTimeMinutes, formatReadingTime } from '@/lib/blogReading'



type Props = {

  post: PublicBlogPost

  compact?: boolean

}



export function BlogCard({ post, compact = false }: Props) {

  const coverUrl = pickBlogCoverUrl(post)

  const readingMinutes = estimateReadingTimeMinutes(post.bodyHtml || post.excerpt || '')



  return (

    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:border-emerald-200 hover:shadow-lg">

      {coverUrl ? (

        <Link to={`/blog/${post.slug}`} className="block overflow-hidden">

          <MediaImage

            src={coverUrl}

            alt={post.title}

            loading="lazy"

            className={cnAspect(compact) + ' w-full object-cover transition duration-500 group-hover:scale-[1.02]'}

          />

        </Link>

      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-5">

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">

          {post.category ? (

            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">{post.category.name}</span>

          ) : null}

          <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>

          <span className="text-slate-400">·</span>

          <span>{formatReadingTime(readingMinutes)}</span>

        </div>

        <Link to={`/blog/${post.slug}`} className="min-w-0">

          <h3

            className={`line-clamp-2 font-semibold text-slate-900 transition group-hover:text-emerald-700 ${compact ? 'text-base' : 'text-lg'}`}

          >

            {post.title}

          </h3>

        </Link>

        {post.excerpt ? (

          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>

        ) : null}

        <Link to={`/blog/${post.slug}`} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">

          Devamını oku →

        </Link>

      </div>

    </article>

  )

}



function cnAspect(compact: boolean): string {

  return compact ? 'aspect-[16/9]' : 'aspect-[16/10]'

}


