import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import type { PublicCampaignBrief } from '@/types/campaign'

const DISMISS_KEY_PREFIX = 'woontegra-announcement-dismiss:'

type Props = {
  campaign: PublicCampaignBrief
}

export function CampaignAnnouncementBar({ campaign }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(`${DISMISS_KEY_PREFIX}${campaign.id}`)
      if (dismissed === '1') setVisible(false)
    } catch {
      /* ignore */
    }
  }, [campaign.id])

  if (!visible) return null

  const text = campaign.shortTitle?.trim() || campaign.description?.trim() || campaign.name
  const bg = campaign.backgroundColor?.trim() || '#047857'
  const color = campaign.textColor?.trim() || '#ffffff'
  const style: CSSProperties = campaign.gradient?.trim()
    ? { background: campaign.gradient, color }
    : { backgroundColor: bg, color }

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(`${DISMISS_KEY_PREFIX}${campaign.id}`, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative z-[60] border-b border-black/10 px-3 py-2 text-center text-sm" style={style}>
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3">
        {campaign.badge ? (
          <span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold sm:inline">
            {campaign.badge}
          </span>
        ) : null}
        <p className="font-medium">{text}</p>
        {campaign.ctaText && campaign.ctaLink ? (
          <Link
            to={campaign.ctaLink}
            className="shrink-0 rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold hover:bg-white/25"
          >
            {campaign.ctaText}
          </Link>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 opacity-80 hover:opacity-100 sm:right-4"
          aria-label="Duyuruyu kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
