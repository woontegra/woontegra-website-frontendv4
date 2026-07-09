import type { LucideIcon } from 'lucide-react'

import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { pickPageHeroImage } from '@/lib/publicContentImages'
import { PublicHeroImage } from '@/media/components/PublicHeroImage'

import { Breadcrumbs, type BreadcrumbItem } from '@/components/public/Breadcrumbs'



export type PageHeroHighlight = {

  icon?: LucideIcon

  title: string

}



type Props = {

  eyebrow?: string

  title: string

  description?: string

  breadcrumbs?: BreadcrumbItem[]

  highlights?: PageHeroHighlight[]

  image?: string | null

  imageAlt?: string

  rightContent?: ReactNode

  children?: ReactNode

  variant?: 'default' | 'soft' | 'compact'

  className?: string

}



export function PageHero({

  eyebrow,

  title,

  description,

  breadcrumbs,

  highlights = [],

  image,

  imageAlt = '',

  rightContent,

  children,

  variant = 'default',

  className,

}: Props) {

  const isCompact = variant === 'compact'

  const isDark = variant === 'default' || variant === 'compact'

  const resolvedImage = image ? pickPageHeroImage({ heroImage: image, image }) : ''
  const showImageColumn = Boolean(rightContent || resolvedImage)



  return (

    <section

      className={cn(

        'relative overflow-hidden',

        isCompact ? 'py-10 md:py-12' : 'py-12 md:py-16 lg:py-20',

        isDark

          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950'

          : 'bg-gradient-to-b from-slate-50 via-white to-slate-100',

        className,

      )}

    >

      {isDark ? (

        <>

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(34,197,94,0.15),transparent_55%)]" />

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_60%,rgba(59,130,246,0.12),transparent_50%)]" />

        </>

      ) : null}

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className={cn('grid items-center gap-10 lg:gap-16', showImageColumn ? 'lg:grid-cols-2' : 'max-w-4xl')}>

          <div className={isDark ? 'text-white' : 'text-slate-900'}>

            {breadcrumbs?.length ? (

              <div className="mb-5">

                <Breadcrumbs items={breadcrumbs} dark={isDark} />

              </div>

            ) : null}

            {eyebrow ? (

              <p

                className={cn(

                  'mb-4 inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide',

                  isDark

                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'

                    : 'border-emerald-200 bg-emerald-50 text-emerald-700',

                )}

              >

                {eyebrow}

              </p>

            ) : null}

            <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">{title}</h1>

            {description ? (

              <p

                className={cn(

                  'mt-5 max-w-xl text-base leading-relaxed md:text-lg',

                  isDark ? 'text-slate-300' : 'text-slate-600',

                )}

              >

                {description}

              </p>

            ) : null}

            {highlights.length > 0 ? (

              <div className="mt-8 grid gap-3 sm:grid-cols-2">

                {highlights.map((card) => (

                  <div

                    key={card.title}

                    className={cn(

                      'rounded-xl border p-4',

                      isDark ? 'border-white/10 bg-white/5 backdrop-blur-sm' : 'border-slate-200 bg-white shadow-sm',

                    )}

                  >

                    {card.icon ? (

                      <card.icon

                        className={cn('mb-2 h-5 w-5', isDark ? 'text-emerald-400' : 'text-emerald-600')}

                        aria-hidden

                      />

                    ) : null}

                    <p className={cn('text-sm font-medium leading-snug', isDark ? 'text-slate-100' : 'text-slate-800')}>

                      {card.title}

                    </p>

                  </div>

                ))}

              </div>

            ) : null}

            {children}

          </div>



          {rightContent ? (

            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">{rightContent}</div>

          ) : resolvedImage ? (

            <PublicHeroImage

              input={{ heroImage: image, image }}

              alt={imageAlt || title}

              loading="eager"

              fetchPriority="high"

              darkFrame={isDark}

              imageClassName="aspect-[4/3] w-full rounded-xl object-cover"

            />

          ) : null}

        </div>

      </div>

    </section>

  )

}

