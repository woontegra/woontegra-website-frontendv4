import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AddItemButton } from '@/builder/admin/ui/FormFields'
import { blogCategoriesFromPosts } from '@/lib/blogShowcasePosts'
import { publicQueryOptions } from '@/lib/publicQueryOptions'
import { blogService } from '@/services/blogService'
import { formatBlogDate } from '@/types/blog'

type Props = {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function BlogPostManualPicker({ selectedIds, onChange }: Props) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['blog', 'admin-picker'],
    queryFn: () => blogService.list(),
    ...publicQueryOptions,
  })

  const posts = data ?? []
  const byId = useMemo(() => new Map(posts.map((p) => [p.id, p])), [posts])

  const addPost = (id: string) => {
    if (!id || selectedIds.includes(id)) return
    onChange([...selectedIds, id])
  }

  const removePost = (id: string) => {
    onChange(selectedIds.filter((x) => x !== id))
  }

  const available = posts.filter((p) => !selectedIds.includes(p.id))

  if (isLoading) {
    return <p className="text-sm text-slate-500">Blog yazıları yükleniyor…</p>
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        Blog listesi alınamadı. API bağlantısını kontrol edin.
      </p>
    )
  }

  if (posts.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
        Yayınlanmış blog yazısı yok. Önce admin panelden blog yazısı ekleyin.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {selectedIds.length > 0 ? (
        <ul className="space-y-2">
          {selectedIds.map((id, index) => {
            const post = byId.get(id)
            return (
              <li
                key={id}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Sıra {index + 1}
                  </p>
                  <p className="truncate text-sm font-medium text-slate-900">
                    {post?.title ?? 'Yazı bulunamadı (silinmiş olabilir)'}
                  </p>
                  {post ? (
                    <p className="text-[11px] text-slate-500">
                      {formatBlogDate(post.publishedAt || post.createdAt)}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => removePost(id)}
                  className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                >
                  Kaldır
                </button>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">Henüz yazı seçilmedi.</p>
      )}

      {available.length > 0 ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <label className="mb-1 block text-xs font-medium text-slate-600">Yazı ekle</label>
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            defaultValue=""
            onChange={(e) => {
              const id = e.target.value
              if (id) addPost(id)
              e.target.value = ''
            }}
          >
            <option value="">Yazı seçin…</option>
            {available.map((post) => (
              <option key={post.id} value={post.id}>
                {post.title}
                {post.category?.name ? ` · ${post.category.name}` : ''}
              </option>
            ))}
          </select>
        </div>
      ) : selectedIds.length > 0 ? (
        <p className="text-xs text-slate-500">Tüm yayınlanmış yazılar listeye eklendi.</p>
      ) : null}

      {selectedIds.length > 1 ? (
        <AddItemButton onClick={() => onChange([...selectedIds].reverse())}>Sırayı ters çevir</AddItemButton>
      ) : null}
    </div>
  )
}

export function BlogCategorySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (categoryId: string) => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['blog', 'categories'],
    queryFn: () => blogService.list(),
    ...publicQueryOptions,
  })

  const categories = blogCategoriesFromPosts(data ?? [])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
    >
      <option value="">{isLoading ? 'Yükleniyor…' : 'Kategori seçin…'}</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label}
        </option>
      ))}
    </select>
  )
}
