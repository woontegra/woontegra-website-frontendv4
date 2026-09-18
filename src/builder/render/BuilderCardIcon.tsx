import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Calculator,
  Check,
  CheckCircle,
  Circle,
  FileText,
  Layers,
  Play,
} from 'lucide-react'
import { tryResolveIcon } from '@/lib/iconRegistry'

/**
 * Builder kart `icon` alanı teknik identifier'dır.
 * Desteklenmeyen değerlerde null — kullanıcıya raw string ASLA basılmaz.
 */
const BUILDER_CARD_ICON_ALIASES: Record<string, LucideIcon> = {
  circle: Circle,
  check: Check,
  'check-circle': CheckCircle,
  calculator: Calculator,
  layers: Layers,
  activity: Activity,
  file: FileText,
  play: Play,
}

export function resolveBuilderCardIcon(name: string | undefined | null): LucideIcon | null {
  const raw = String(name || '').trim()
  if (!raw) return null
  const lower = raw.toLocaleLowerCase('en')
  return BUILDER_CARD_ICON_ALIASES[lower] ?? tryResolveIcon(raw)
}

export function BuilderCardIcon({
  name,
  className,
}: {
  name?: string | null
  className?: string
}) {
  const Icon = resolveBuilderCardIcon(name)
  if (!Icon) return null
  return <Icon className={className} aria-hidden />
}
