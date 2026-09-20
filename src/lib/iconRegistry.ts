import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  Box,
  Boxes,
  Cloud,
  Code2,
  Cpu,
  CreditCard,
  Database,
  FileCheck,
  FileSpreadsheet,
  Gamepad2,
  Globe,
  Image,
  Key,
  Link,
  Mail,
  Plug,
  Server,
  Layers,
  Layout,
  LayoutDashboard,
  Lightbulb,
  Lock,
  Megaphone,
  Monitor,
  Package,
  Palette,
  RefreshCw,
  Scale,
  Search,
  Settings,
  Share2,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Truck,
  Users,
  Workflow,
  Zap,
  Award,
  Building2,
  Eye,
  Rocket,
  Wrench,
} from 'lucide-react'

export const ICON_OPTIONS = [
  'Globe',
  'ShoppingCart',
  'Search',
  'Megaphone',
  'Share2',
  'Palette',
  'Lightbulb',
  'Code2',
  'Target',
  'Workflow',
  'Zap',
  'BarChart3',
  'Package',
  'Truck',
  'RefreshCw',
  'Boxes',
  'LayoutDashboard',
  'Layers',
  'Database',
  'Settings',
  'Users',
  'Cloud',
  'Monitor',
  'Smartphone',
  'Layout',
  'TrendingUp',
  'Shield',
  'CreditCard',
  'Activity',
  'Lock',
  'Scale',
  'FileCheck',
  'Gamepad2',
  'Cpu',
  'Sparkles',
] as const

export type IconName = (typeof ICON_OPTIONS)[number]

const iconMap: Record<string, LucideIcon> = {
  Globe,
  ShoppingCart,
  Search,
  Megaphone,
  Share2,
  Palette,
  Lightbulb,
  Code2,
  Target,
  Workflow,
  Zap,
  BarChart3,
  Package,
  Truck,
  RefreshCw,
  Boxes,
  LayoutDashboard,
  Layers,
  Database,
  Settings,
  Users,
  Cloud,
  Monitor,
  Smartphone,
  Layout,
  TrendingUp,
  Shield,
  CreditCard,
  Activity,
  Lock,
  Scale,
  FileCheck,
  FileSpreadsheet,
  Gamepad2,
  Plug,
  Link,
  Server,
  Image,
  Mail,
  Key,
  Cpu,
  Sparkles,
  Award,
  Building2,
  Eye,
  Rocket,
  Wrench,
  // CMS / builder kebab + kısa alias
  boxes: Boxes,
  sparkles: Sparkles,
  eye: Eye,
  rocket: Rocket,
  settings: Settings,
  'building-2': Building2,
  package: Package,
  award: Award,
  layers: Layers,
  search: Search,
  wrench: Wrench,
  'bar-chart-3': BarChart3,
  'refresh-cw': RefreshCw,
  target: Target,
  code: Code2,
  'code-2': Code2,
  lightbulb: Lightbulb,
}

function iconLookupKeys(name: string): string[] {
  const raw = name.trim()
  if (!raw) return []
  const lower = raw.toLocaleLowerCase('en')
  const kebab = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLocaleLowerCase('en')
  const compact = lower.replace(/[-_\s]/g, '')
  return [...new Set([raw, lower, kebab, compact])]
}

const iconLookup: Record<string, LucideIcon> = {}
for (const [key, icon] of Object.entries(iconMap)) {
  for (const variant of iconLookupKeys(key)) {
    if (!iconLookup[variant]) iconLookup[variant] = icon
  }
}

export function resolveIcon(name?: string): LucideIcon {
  return tryResolveIcon(name) ?? Box
}

/** Builder kart ikonu — bilinmeyen identifier için null (raw string basma) */
export function tryResolveIcon(name?: string | null): LucideIcon | null {
  const key = String(name || '').trim()
  if (!key) return null
  for (const variant of iconLookupKeys(key)) {
    const found = iconLookup[variant]
    if (found) return found
  }
  return null
}

export const GRADIENT_OPTIONS = [
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-purple-500',
  'from-orange-500 to-red-500',
  'from-pink-500 to-rose-500',
  'from-fuchsia-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-slate-700 to-slate-900',
  'from-purple-500 to-indigo-500',
  'from-sky-500 to-blue-600',
  'from-slate-600 to-slate-800',
] as const
