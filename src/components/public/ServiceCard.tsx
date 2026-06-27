import type { ServiceCardConfig } from '@/data/serviceCardsContent'
import { MarketingFeatureCard } from '@/components/public/MarketingFeatureCard'

type Props = {
  card: ServiceCardConfig
}

export function ServiceCard({ card }: Props) {
  return (
    <MarketingFeatureCard
      icon={card.icon}
      title={card.title}
      description={card.description}
      href={card.href}
      gradient={card.gradient}
      tag={card.tag}
    />
  )
}
