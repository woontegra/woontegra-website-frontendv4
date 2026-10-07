import type { LucideIcon } from 'lucide-react'
import { AppWindow, Globe, Laptop } from 'lucide-react'
import type { ProductPlatformFamily, SoftwarePlatformId } from '@/components/public/product/softwarePlatforms'

const PLATFORM_ICONS: Partial<Record<SoftwarePlatformId, LucideIcon>> = {
  web: Globe,
  windows: AppWindow,
  macos: Laptop,
}

type Props = {
  family: ProductPlatformFamily
  value: SoftwarePlatformId
  onChange: (platformId: SoftwarePlatformId) => void
}

export function SoftwarePlatformPicker({ family, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-slate-100/90 p-1" role="tablist" aria-label="Platform">
      {family.platforms.map((platform) => {
        const selected = platform.id === value
        const Icon = PLATFORM_ICONS[platform.id]
        return (
          <button
            key={platform.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(platform.id)}
            className={`flex min-h-[4.75rem] flex-col items-center justify-center rounded-xl px-1.5 py-2 text-center transition ${
              selected ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {Icon ? <Icon className={`mb-1 h-4 w-4 ${selected ? 'text-sky-600' : 'text-slate-400'}`} aria-hidden /> : null}
            <span className="text-[11px] font-bold tracking-wide sm:text-xs">{platform.label}</span>
            <span className="mt-0.5 text-[10px] font-medium leading-snug text-slate-500">{platform.summary}</span>
          </button>
        )
      })}
    </div>
  )
}
