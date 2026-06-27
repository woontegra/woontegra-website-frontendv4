import type { LucideIcon } from 'lucide-react'
import {
  Award,
  CheckCircle,
  Cloud,
  Code,
  Lightbulb,
  Palette,
  Scale,
  ShoppingCart,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'

const MAP: Record<string, LucideIcon> = {
  code: Code,
  palette: Palette,
  'shopping-cart': ShoppingCart,
  cloud: Cloud,
  scale: Scale,
  lightbulb: Lightbulb,
  award: Award,
  target: Target,
  zap: Zap,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
}

export function HomeIcon({ name, className }: { name: string; className?: string }) {
  const Icon = MAP[name] ?? Code
  return <Icon className={className} aria-hidden />
}
