import { useEffect, useMemo, useRef, useState } from 'react'
import { catalogMediaService, getErrorMessage } from '@/services/catalogMediaService'
import { resolveCatalogMediaPreviewUrl } from '@/media/resolveCatalogMediaPreviewUrl'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import {
  catalogMediaPickUrl,
  type CatalogMedia,
  type CatalogMediaFileType,
} from '@/types/catalogMedia'
import { cn } from '@/lib/cn'
import {
  catalogMediaStorageSource,
  mediaStorageSourceBadgeClass,
  mediaStorageSourceLabel,
} from '@/lib/mediaStorageSource'

export type MediaPickerModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  onSelect: (media: CatalogMedia) => void
  /** Varsayılan: yalnızca IMAGE */
  allowedTypes?: CatalogMediaFileType[]
  /** Upload alanını göster (endpoint mevcut) */
  allowUpload?: boolean
  /** Vercel Blob alt klasörü: logo, hero, blog, products, builder, general */
  uploadFolder?: string
}

const DEFAULT_TYPES: CatalogMediaFileType[] = ['IMAGE']

export function MediaPickerModal({
  open,
  title = 'Medya kütüphanesi',
  onClose,
  onSelect,
  allowedTypes = DEFAULT_TYPES,
  allowUpload = true,
  uploadFolder = 'general',
}: MediaPickerModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<CatalogMedia[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
      return
    }

    let cancelled = false
    void (async () => {
      setError(null)
      setLoading(true)
      try {
        const lists = await Promise.all(allowedTypes.map((t) => catalogMediaService.list(t)))
        if (cancelled) return
        const merged = lists
          .flat()
          .filter((m) => m.fileType === 'IMAGE' || allowedTypes.includes(m.fileType))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        setItems(merged)
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Medya listesi yüklenemedi'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, allowedTypes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (m) =>
        m.originalName.toLowerCase().includes(q) ||
        m.fileName.toLowerCase().includes(q) ||
        catalogMediaPickUrl(m).toLowerCase().includes(q),
    )
  }, [items, query])

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Yalnızca görsel dosyaları yüklenebilir.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const created = await catalogMediaService.upload(file, uploadFolder)
      setItems((prev) => [created, ...prev])
    } catch (err) {
      setError(getErrorMessage(err, 'Yükleme başarısız'))
    } finally {
      setUploading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4">
      <button type="button" className="absolute inset-0" aria-label="Kapat" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
        className="relative flex max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="media-picker-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Yeni görseller Vercel Blob&apos;a yüklenir · klasör: {uploadFolder}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            Kapat
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dosya adı veya URL ara…"
            className="min-w-[200px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          {allowUpload ? (
            <>
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
              >
                {uploading ? 'Yükleniyor…' : 'Yeni görsel yükle'}
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-400">Upload devre dışı</span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {loading ? (
            <p className="py-12 text-center text-sm text-slate-500">Medya yükleniyor…</p>
          ) : null}

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
              {error.includes('BLOB_READ_WRITE_TOKEN') ? (
                <p className="mt-1 text-xs text-red-700">
                  Railway/Vercel backend ortamına <code className="rounded bg-red-100 px-1">BLOB_READ_WRITE_TOKEN</code>{' '}
                  ekleyin (Vercel Dashboard → Storage → Blob).
                </p>
              ) : (
                <p className="mt-1 text-xs text-red-600">URL alanından elle girmeye devam edebilirsiniz.</p>
              )}
            </div>
          ) : null}

          {!loading && !error && filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              {items.length === 0 ? 'Henüz görsel yok. Yükleyin veya URL girin.' : 'Arama sonucu bulunamadı.'}
            </p>
          ) : null}

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => {
              const previewSrc = resolveCatalogMediaPreviewUrl(m.publicUrl || m.url)
              const storedUrl = catalogMediaPickUrl(m)
              const source = catalogMediaStorageSource(m)
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(m)
                      onClose()
                    }}
                    className={cn(
                      'group flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition',
                      'hover:border-blue-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/30',
                    )}
                  >
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {m.fileType === 'IMAGE' ? (
                        <img
                          src={previewSrc}
                          alt={m.originalName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = resolveMediaUrl('/product-placeholder.svg')
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-500">
                          {m.fileType}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-100 p-3">
                      <p className="truncate text-sm font-medium text-slate-900">{m.originalName}</p>
                      <span
                        className={cn(
                          'mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                          mediaStorageSourceBadgeClass(source),
                        )}
                      >
                        {mediaStorageSourceLabel(source)}
                      </span>
                      <p className="mt-0.5 truncate text-[11px] text-slate-500" title={storedUrl}>
                        {storedUrl}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {(m.fileSize / 1024).toFixed(1)} KB · {m.mimeType || 'image'}
                      </p>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
