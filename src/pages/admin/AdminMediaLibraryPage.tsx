import { useEffect, useMemo, useRef, useState } from 'react'
import { catalogMediaService, getErrorMessage } from '@/services/catalogMediaService'
import { resolveCatalogMediaPreviewUrl } from '@/media/resolveCatalogMediaPreviewUrl'
import { catalogMediaPickUrl, type CatalogMedia, type CatalogMediaFileType } from '@/types/catalogMedia'
import { cn } from '@/lib/cn'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useToastStore } from '@/store/toastStore'
import {
  catalogMediaStorageSource,
  mediaStorageSourceBadgeClass,
  mediaStorageSourceLabel,
} from '@/lib/mediaStorageSource'

export function AdminMediaLibraryPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToastStore((s) => s.show)
  const [items, setItems] = useState<CatalogMedia[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<CatalogMediaFileType | 'ALL'>('ALL')

  const load = async () => {
    setError(null)
    setLoading(true)
    try {
      const types: CatalogMediaFileType[] = ['IMAGE', 'DOWNLOAD', 'DOCUMENT']
      const lists = await Promise.all(types.map((t) => catalogMediaService.list(t)))
      setItems(
        lists
          .flat()
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
      )
    } catch (err) {
      setError(getErrorMessage(err, 'Medya listesi yüklenemedi'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    let list = items
    if (typeFilter !== 'ALL') list = list.filter((m) => m.fileType === typeFilter)
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (m) =>
        m.originalName.toLowerCase().includes(q) ||
        m.fileName.toLowerCase().includes(q) ||
        catalogMediaPickUrl(m).toLowerCase().includes(q),
    )
  }, [items, query, typeFilter])

  const onUpload = async (file: File) => {
    setUploading(true)
    try {
      await catalogMediaService.upload(file, 'general')
      toast('Dosya yüklendi', 'success')
      await load()
    } catch (err) {
      toast(getErrorMessage(err, 'Yükleme başarısız'), 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Medya Kütüphanesi</h1>
          <p className="mt-1 text-sm text-slate-600">
            GET /api/admin/media · POST /api/admin/media/upload
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void onUpload(file)
              e.target.value = ''
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {uploading ? 'Yükleniyor…' : 'Dosya yükle'}
          </button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Dosya adı veya URL ara…"
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CatalogMediaFileType | 'ALL')}
            className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="ALL">Tüm tipler</option>
            <option value="IMAGE">Görsel</option>
            <option value="DOWNLOAD">İndirme</option>
            <option value="DOCUMENT">Döküman</option>
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Medya yükleniyor…
        </div>
      ) : null}

      {error ? (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      ) : null}

      {!loading && !error && filtered.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-500">Medya bulunamadı.</Card>
      ) : null}

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => {
            const preview = resolveCatalogMediaPreviewUrl(item.publicUrl || item.url)
            const url = catalogMediaPickUrl(item)
            const source = catalogMediaStorageSource(item)
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-slate-100">
                  {item.fileType === 'IMAGE' && preview ? (
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      {item.fileType}
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <p className="truncate text-xs font-medium text-slate-900">{item.originalName}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge tone="default">{item.fileType}</Badge>
                    <span
                      className={cn(
                        'inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium',
                        mediaStorageSourceBadgeClass(source),
                      )}
                    >
                      {mediaStorageSourceLabel(source)}
                    </span>
                  </div>
                  <p className="truncate text-[10px] text-slate-400" title={url}>
                    {url}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
