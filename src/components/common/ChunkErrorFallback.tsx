import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { isChunkLoadError, markChunkReloadAttempted } from '@/lib/chunkLoadError'

function reloadPage() {
  window.location.reload()
}

function ErrorScreen({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{message}</p>
        <Button type="button" className="mt-6" onClick={reloadPage}>
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
    if (markChunkReloadAttempted()) {
      setAutoReloading(true)
      reloadPage()
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

    return (
      <ErrorScreen
        title="Sayfa güncellendi"
        message="Woontegra'nın yeni sürümü yayınlandı. Devam etmek için sayfayı yenileyebilirsiniz."
      />
    )
  }

  return (
    <ErrorScreen
      title="Bir şeyler ters gitti"
      message="Sayfa yüklenirken beklenmeyen bir sorun oluştu. Lütfen sayfayı yenileyin."
    />
  )
}
