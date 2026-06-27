import { Loader2 } from 'lucide-react'

type Props = {
  label?: string
}

export function LoadingState({ label = 'Yükleniyor…' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
      <p className="text-sm">{label}</p>
    </div>
  )
}
