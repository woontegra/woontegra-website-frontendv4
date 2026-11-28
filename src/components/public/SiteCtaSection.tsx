import { Link } from 'react-router-dom'
import { resolvePublicHref } from '@/lib/publicNavUrl'

type Props = {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  secondaryButtonText?: string
  secondaryButtonLink?: string
}

export function SiteCtaSection({
  title,
  description,
  buttonText = 'İletişime Geç',
  buttonLink = '/iletisim',
  secondaryButtonText,
  secondaryButtonLink,
}: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-col gap-6 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#1D6FD8] px-6 py-10 text-white sm:px-12 sm:py-14 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
          {description ? <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">{description}</p> : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          {buttonText ? (
            <Link
              to={resolvePublicHref(buttonLink)}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 text-[15px] font-bold text-slate-950 transition hover:bg-slate-100"
            >
              {buttonText}
            </Link>
          ) : null}
          {secondaryButtonText && secondaryButtonLink ? (
            <Link
              to={resolvePublicHref(secondaryButtonLink)}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/50 px-6 text-[15px] font-bold text-white transition hover:bg-white/10"
            >
              {secondaryButtonText}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
