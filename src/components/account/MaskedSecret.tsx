import { Copy, Check, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

type Props = {
  value: string
  label?: string
  className?: string
}

export function MaskedSecret({ value, label = 'Gizli değer', className }: Props) {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* */
    }
  }

  return (
    <div className={cn('rounded-xl border border-slate-200 bg-slate-50/80 p-3', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setVisible((v) => !v)}>
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {visible ? 'Gizle' : 'Göster'}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={onCopy}>
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </Button>
        </div>
      </div>
      <p className="mt-2 break-all font-mono text-sm text-slate-900">{visible ? value : maskValue(value)}</p>
    </div>
  )
}

function maskValue(value: string): string {
  if (value.length <= 8) return '••••••••'
  return `${value.slice(0, 4)}${'•'.repeat(Math.min(12, value.length - 8))}${value.slice(-4)}`
}
