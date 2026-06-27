import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { MediaImage } from '@/media/components/MediaImage'
import { resolveIcon } from '@/lib/iconRegistry'
import { cn } from '@/lib/cn'
import {
  enabledBrands,
  enabledHighlights,
  enabledIconCards,
  enabledSimpleCards,
  enabledStats,
  enabledTimelineSteps,
  type AboutPageContent,
} from '@/types/aboutPageContent'

export function AboutHeroSection({ hero }: { hero: AboutPageContent['hero'] }) {
  const highlights = enabledHighlights(hero.highlights)
  return (
    <>
      {highlights.length > 0 ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {highlights.map((card) => {
            const Icon = resolveIcon(card.icon)
            return (
              <div key={card.id} className={cn('rounded-xl border bg-gradient-to-br p-4', card.cardClass)}>
                <Icon className={cn('mb-2 h-5 w-5', card.iconClass)} aria-hidden />
                <p className="text-sm font-medium leading-snug text-slate-100">{card.title}</p>
              </div>
            )
          })}
        </div>
      ) : null}
    </>
  )
}

export function AboutWhatIs({ whatIs }: { whatIs: AboutPageContent['whatIs'] }) {
  const cards = enabledSimpleCards(whatIs.cards)
  if (!whatIs.title && whatIs.paragraphs.length === 0 && cards.length === 0) return null
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {whatIs.title ? (
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{whatIs.title}</h2>
            ) : null}
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              {whatIs.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {whatIs.highlight ? <p className="font-semibold text-slate-900">{whatIs.highlight}</p> : null}
            </div>
          </div>
          {cards.length > 0 ? (
            <div className="grid gap-4">
              {cards.map((card) => (
                <div key={card.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                  {card.text ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.text}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function AboutTimeline({ timeline }: { timeline: AboutPageContent['timeline'] }) {
  const steps = enabledTimelineSteps(timeline.steps)
  if (!timeline.title && steps.length === 0) return null
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {timeline.title ? (
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{timeline.title}</h2>
          ) : null}
          {timeline.subtitle ? <p className="mt-4 text-base text-slate-600">{timeline.subtitle}</p> : null}
        </div>
        <div className="mx-auto mt-14 max-w-3xl">
          {steps.map((step, index) => {
            const Icon = resolveIcon(step.icon)
            return (
              <div key={step.id} className="relative flex gap-5 pb-10 last:pb-0">
                <div className="relative z-10 flex shrink-0">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-full shadow-lg', step.color)}>
                    <Icon className="h-5 w-5 text-white" aria-hidden />
                  </div>
                </div>
                <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Adım {index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{step.title}</h3>
                  {step.text ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function AboutDifferentiators({ section }: { section: AboutPageContent['differentiators'] }) {
  const cards = enabledIconCards(section.cards)
  if (!section.title && cards.length === 0) return null
  return (
    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {section.title ? (
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{section.title}</h2>
          ) : null}
          {section.subtitle ? <p className="mt-4 text-base text-slate-400">{section.subtitle}</p> : null}
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((item) => {
            const Icon = resolveIcon(item.icon)
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 transition hover:border-emerald-500/40"
              >
                <div className={cn('mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br', item.gradient)}>
                  <Icon className="h-7 w-7 text-white" aria-hidden />
                </div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                {item.text ? <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.text}</p> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function AboutBrands({ brands }: { brands: AboutPageContent['brands'] }) {
  const cards = enabledBrands(brands.cards)
  if (!brands.title && cards.length === 0) return null
  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {brands.title ? (
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{brands.title}</h2>
          ) : null}
          {brands.subtitle ? <p className="mt-4 text-base text-slate-600">{brands.subtitle}</p> : null}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((brand) => (
            <a
              key={brand.id}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl"
            >
              {brand.image ? (
                <div className="relative h-48 overflow-hidden sm:h-52">
                  <MediaImage
                    src={brand.image}
                    alt={brand.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h3 className="text-lg font-bold text-slate-900">{brand.name}</h3>
                {brand.text ? <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{brand.text}</p> : null}
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-emerald-700 group-hover:underline">
                  Siteyi ziyaret et
                  <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutWorkApproach({ section }: { section: AboutPageContent['workApproach'] }) {
  const cards = enabledIconCards(section.cards)
  if (!section.title && cards.length === 0) return null
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {section.title ? (
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{section.title}</h2>
          ) : null}
          {section.subtitle ? <p className="mt-4 text-base text-slate-600">{section.subtitle}</p> : null}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => {
            const Icon = resolveIcon(item.icon)
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className={cn('mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br', item.gradient)}>
                  <Icon className="h-6 w-6 text-white" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                {item.text ? <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.text}</p> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function AboutStructure({ section }: { section: AboutPageContent['structure'] }) {
  const stats = enabledStats(section.stats)
  if (!section.title && section.paragraphs.length === 0 && stats.length === 0) return null
  return (
    <section className="bg-slate-50 py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            {section.title ? (
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{section.title}</h2>
            ) : null}
            <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-600">
              {section.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          {stats.length > 0 ? (
            <div className="grid gap-4">
              {stats.map((stat) => {
                const Icon = resolveIcon(stat.icon)
                return (
                  <div key={stat.id} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{stat.title}</h3>
                      {stat.text ? <p className="mt-1 text-sm leading-relaxed text-slate-600">{stat.text}</p> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function AboutVision({ vision }: { vision: AboutPageContent['vision'] }) {
  if (!vision.title && vision.paragraphs.length === 0) return null
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {vision.title ? <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{vision.title}</h2> : null}
        <div className="mt-6 space-y-4 text-base leading-relaxed text-slate-300">
          {vision.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutCta({ cta }: { cta: AboutPageContent['cta'] }) {
  if (!cta.title && !cta.buttonText) return null
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 py-20 md:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {cta.title ? (
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">{cta.title}</h2>
        ) : null}
        {cta.subtitle ? (
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-emerald-50 md:text-lg">{cta.subtitle}</p>
        ) : null}
        {cta.buttonText ? (
          <Link
            to={cta.buttonHref || '/iletisim'}
            className="mt-10 inline-flex items-center justify-center rounded-lg border border-white/40 px-10 py-4 text-base text-white transition hover:bg-white hover:text-emerald-700"
          >
            {cta.buttonText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        ) : null}
      </div>
    </section>
  )
}
