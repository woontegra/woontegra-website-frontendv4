import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { CollapsibleItem } from '@/builder/admin/ui/SettingsAccordion'
import { AddItemButton, ImageUrlField, TextField } from '@/builder/admin/ui/FormFields'
import { useFocusCollapsible } from '@/builder/admin/settings/useFocusCollapsible'
import type { ProductDetailBlock, ProductDetailGalleryItem } from '@/builder/types/productDetail'

type Props = {
  block: ProductDetailBlock
  onChange: (block: ProductDetailBlock) => void
}

function moveGalleryItem(items: ProductDetailGalleryItem[], index: number, direction: -1 | 1): ProductDetailGalleryItem[] {
  const target = index + direction
  if (target < 0 || target >= items.length) return items
  const next = items.slice()
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item)
  return next
}

export function ProductDetailGallerySettings({ block, onChange }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  useFocusCollapsible(setOpenId)

  const gallery = block.settings.gallery

  const setGallery = (next: ProductDetailGalleryItem[]) => {
    onChange({
      ...block,
      settings: {
        ...block.settings,
        gallery: next,
      },
    })
  }

  const updateItem = (id: string, patch: Partial<ProductDetailGalleryItem>) => {
    setGallery(gallery.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-slate-500">
        İlk görsel ana ürün görseli olarak kullanılır. Birden fazla ekran görüntüsü ekleyebilirsiniz; public sayfada
        thumbnail galerisi olarak görünür.
      </p>

      {gallery.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
          Henüz görsel eklenmedi. Aşağıdan görsel ekleyin.
        </p>
      ) : null}

      <div className="space-y-2">
        {gallery.map((item, index) => (
          <CollapsibleItem
            key={item.id}
            title={`Görsel ${index + 1}${index === 0 ? ' · Ana görsel' : ''}`}
            subtitle={item.title?.trim() || item.alt?.trim() || item.url || 'Görsel seçilmedi'}
            open={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
            onRemove={() => setGallery(gallery.filter((g) => g.id !== item.id))}
          >
            <ImageUrlField
              label="Görsel"
              settingsFieldId={`pdp-gallery-${item.id}-image`}
              uploadFolder="products"
              value={item.url}
              onChange={(url) => updateItem(item.id, { url })}
              recommendedSize="1600x900 px (16:9) veya 1200x900 px (4:3)"
            />
            <TextField
              label="Başlık"
              hint="Opsiyonel — thumbnail ve erişilebilirlik için"
              settingsFieldId={`pdp-gallery-${item.id}-title`}
              value={item.title ?? ''}
              onChange={(title) => updateItem(item.id, { title })}
            />
            <TextField
              label="Alt metin"
              hint="Opsiyonel — ekran okuyucu ve SEO için"
              settingsFieldId={`pdp-gallery-${item.id}-alt`}
              value={item.alt ?? ''}
              onChange={(alt) => updateItem(item.id, { alt })}
            />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => setGallery(moveGalleryItem(gallery, index, -1))}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                Yukarı
              </button>
              <button
                type="button"
                disabled={index === gallery.length - 1}
                onClick={() => setGallery(moveGalleryItem(gallery, index, 1))}
                className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                Aşağı
              </button>
            </div>
          </CollapsibleItem>
        ))}
      </div>

      <AddItemButton
        onClick={() => {
          const id = `pdp-gal-${Date.now()}`
          setGallery([...gallery, { id, url: '', title: '', alt: '' }])
          setOpenId(id)
        }}
      >
        Görsel ekle
      </AddItemButton>
    </div>
  )
}
