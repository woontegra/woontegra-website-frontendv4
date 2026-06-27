import { Link } from 'react-router-dom'
import type { CSSProperties } from 'react'
import { MediaImage } from '@/media/components/MediaImage'
import type { PublicCampaignBrief } from '@/types/campaign'
import { cn } from '@/lib/cn'

type Props = {
  campaign: PublicCampaignBrief
  className?: string
}

export function CampaignBanner({ campaign, className }: Props) {
  const title = campaign.shortTitle?.trim() || campaign.name
  const description = campaign.description?.trim()
  const bg = campaign.backgroundColor?.trim() || '#ecfdf5'
  const color = campaign.textColor?.trim() || '#064e3b'
  const image = campaign.desktopImage?.trim() || campaign.mobileImage?.trim() || ''

  const style: CSSProperties = campaign.gradient?.trim()
    ? { background: campaign.gradient, color }
    : { backgroundColor: bg, color }

  const inner = (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-emerald-100',
        campaign.ctaLink ? 'transition hover:shadow-lg' : '',
        className,
      )}
      style={style}
    >
      {campaign.overlay ? (
        <div className="pointer-events-none absolute inset-0" style={{ background: campaign.overlay }} aria-hidden />
      ) : null}
      <div className="relative grid gap-6 p-6 md:grid-cols-2 md:items-center md:p-8">
        <div className="space-y-3">
          {campaign.badge ? (
            <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">{campaign.badge}</span>
          ) : null}
          <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
          {description ? <p className="text-sm leading-relaxed opacity-90">{description}</p> : null}
          {campaign.ctaText && campaign.ctaLink ? (
            <span className="inline-flex rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold">{campaign.ctaText}</span>
          ) : null}
        </div>
        {image ? (
          <MediaImage src={image} alt={title} className="aspect-[16/9] w-full rounded-xl object-cover" loading="lazy" />
        ) : null}
      </div>
    </div>
  )

  if (campaign.ctaLink) {
    return (
      <Link to={campaign.ctaLink} className="block">
        {inner}
      </Link>
    )
  }

  return inner
}
