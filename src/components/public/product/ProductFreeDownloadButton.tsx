import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'
import type { PublicProductDownloadFile } from '@/types/product'
import { triggerFreeProductDownload } from '@/lib/downloadFile'
import { resolveProductDownloadButtonLabel } from '@/lib/freeProductDownload'
import { cn } from '@/lib/cn'

type Props = {
  file: PublicProductDownloadFile
  variant?: 'primary' | 'secondary'
}

export function ProductFreeDownloadButton({ file, variant = 'primary' }: Props) {
  const { annotateFields } = useBuilderEditContext()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const label = resolveProductDownloadButtonLabel(file)
  const buttonVariant = file.type === 'portable' ? 'secondary' : variant

  if (annotateFields) {
    return (
      <span
        className={cn(
          'inline-flex w-full min-w-[160px] items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold',
          buttonVariant === 'secondary'
            ? 'border border-slate-200 bg-white text-slate-800'
            : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 text-white shadow-lg shadow-emerald-500/20',
        )}
        aria-hidden
      >
        <Download className="h-4 w-4" />
        {label}
      </span>
    )
  }

  const handleClick = async () => {
    setError(null)
    setLoading(true)
    try {
      await triggerFreeProductDownload(file.downloadPath)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dosya indirilemedi. Lütfen daha sonra tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-1">
      <Button
        type="button"
        className={cn(
          'w-full min-w-[160px] rounded-2xl',
          buttonVariant === 'secondary' ? 'border-slate-200 bg-white shadow-sm' : '!bg-gradient-to-r !from-emerald-600 !via-emerald-500 !to-sky-500 shadow-lg shadow-emerald-500/20',
        )}
        variant={buttonVariant}
        disabled={loading}
        onClick={() => void handleClick()}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {loading ? 'İndirme hazırlanıyor...' : label}
      </Button>
      {error ? <p className="max-w-xs text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
