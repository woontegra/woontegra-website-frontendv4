import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { HeroResponsiveImage } from '@/media/components/HeroResponsiveImage'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import type { HomePageContent } from '@/types/homePageContent'

type Props = { hero: HomePageContent['hero'] }

function scrollToHash(href: string) {
  if (!href.startsWith('#')) return false
  document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  return true
}

export function HomeHero({ hero }: Props) {
  if (!hero.enabled) return null

  const imageUrl = hero.image?.trim() ? resolveMediaUrl(hero.image) : ''

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-green-900 py-12 sm:py-16 lg:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.2),transparent_70%)]" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="text-white">
            {hero.tag ? (
              <div className="mb-4 inline-block rounded-full bg-green-500/20 px-3 py-1.5">
                <span className="text-xs font-medium text-green-400">{hero.tag}</span>
              </div>
            ) : null}
            <h1 className="mb-4 text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl">
              {hero.title}
            </h1>
            {hero.subtitle ? (
              <p className="mb-6 max-w-xl text-base leading-relaxed text-gray-300 md:text-lg">{hero.subtitle}</p>
            ) : null}
            <div className="flex flex-wrap gap-3">
              {hero.button1Text ? (
                hero.button1Href.startsWith('/') ? (
                  <Link
                    to={hero.button1Href}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    {hero.button1Text}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => scrollToHash(hero.button1Href)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700"
                  >
                    {hero.button1Text}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )
              ) : null}
              {hero.button2Text ? (
                <Link
                  to={hero.button2Href || '/iletisim'}
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  {hero.button2Text}
                </Link>
              ) : null}
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-green-500/30 to-blue-500/30 blur-3xl" />
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 opacity-20 blur transition duration-500 group-hover:opacity-40" />
            <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl">
              {imageUrl ? (
                <HeroResponsiveImage
                  sources={{ desktop: imageUrl, tablet: imageUrl, mobile: imageUrl }}
                  alt="Woontegra Teknoloji"
                  loading="eager"
                  fetchPriority="high"
                  className="aspect-[8/5] w-full object-cover"
                />
              ) : (
                <div
                  className="aspect-[8/5] w-full bg-gradient-to-br from-emerald-600/40 via-slate-800 to-blue-900/50"
                  aria-hidden
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
