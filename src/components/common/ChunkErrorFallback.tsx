import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { cacheBustReload, performCleanRecoveryReload } from '@/lib/cacheBustReload'
import { isChunkLoadError } from '@/lib/chunkLoadError'

function ErrorScreen({
  title,
  message,
  detail,
  onReload,
}: {
  title: string
  message: string
  detail?: string
  onReload: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        {detail ? (
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-left text-xs leading-relaxed text-slate-500 break-words">
            {detail}
          </p>
        ) : null}
        <Button type="button" className="mt-6" onClick={onReload}>
          Sayfayı yenile
        </Button>
      </div>
    </div>
  )
}

type Props = {
  error: unknown
}

export function ChunkErrorFallback({ error }: Props) {
  const chunkError = isChunkLoadError(error)
  const [autoReloading, setAutoReloading] = useState(false)

  useEffect(() => {
    console.error('[ChunkErrorFallback]', error)
  }, [error])

  useEffect(() => {
    if (!chunkError) return
    if (cacheBustReload()) {
      setAutoReloading(true)
    }
  }, [chunkError])

  if (chunkError) {
    if (autoReloading) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
          <p className="text-sm text-slate-600">Sayfa güncelleniyor…</p>
        </div>
      )
    }

    const detail =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : undefined

    return (
      <ErrorScreen
        title="Sayfa güncellendi"
        message="Woontegra'nın yeni sürümü yayınlandı. Devam etmek için sayfayı yenileyin; oturum ve sepet bilgileriniz korunur."
        detail={detail}
        onReload={() => performCleanRecoveryReload()}
      />
    )
  }

  return (
    <ErrorScreen
      title="Bir şeyler ters gitti"
      message="Sayfa yüklenirken beklenmeyen bir sorun oluştu. Lütfen sayfayı yenileyin."
      detail={error instanceof Error ? error.message : undefined}
      onReload={() => performCleanRecoveryReload()}
    />
  )
}
