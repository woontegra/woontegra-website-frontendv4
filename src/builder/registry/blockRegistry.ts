import type { BlockTypeId } from '@/builder/types'
import { BLOCK_TYPE_LABELS } from '@/builder/types'

export type BlockDefinition = {
  type: BlockTypeId
  label: string
  description: string
  createDefault?: () => unknown
}

const definitions: BlockDefinition[] = [
  {
    type: 'hero',
    label: BLOCK_TYPE_LABELS.hero,
    description: 'Tek görsel, carousel veya gradient hero; tüm alanlar opsiyonel.',
  },
  {
    type: 'rich-text',
    label: BLOCK_TYPE_LABELS['rich-text'],
    description: 'Başlık, alt başlık ve zengin metin.',
  },
  {
    type: 'image-text',
    label: BLOCK_TYPE_LABELS['image-text'],
    description: 'Görsel + metin; görsel ve buton opsiyonel.',
  },
  {
    type: 'card-grid',
    label: BLOCK_TYPE_LABELS['card-grid'],
    description: 'Kart ekle/sil/sırala; ikon/görsel opsiyonel.',
  },
  {
    type: 'services-showcase',
    label: BLOCK_TYPE_LABELS['services-showcase'],
    description: 'Hizmet kartları vitrini; otomatik veya manuel.',
  },
  {
    type: 'products-showcase',
    label: BLOCK_TYPE_LABELS['products-showcase'],
    description: 'Manuel veya kategori; fiyat/sepet/detay panelden.',
  },
  {
    type: 'blog-showcase',
    label: BLOCK_TYPE_LABELS['blog-showcase'],
    description: 'Son yazılar, kategori veya manuel seçim.',
  },
  {
    type: 'cta',
    label: BLOCK_TYPE_LABELS.cta,
    description: 'Tek/çift buton veya butonsuz CTA.',
  },
  {
    type: 'faq',
    label: BLOCK_TYPE_LABELS.faq,
    description: 'Soru-cevap listesi; sıralama ve açılır görünüm.',
  },
  {
    type: 'legacy-html',
    label: BLOCK_TYPE_LABELS['legacy-html'],
    description: 'Mevcut HTML içeriği koruma bloğu.',
  },
]

export function listBlockDefinitions(): BlockDefinition[] {
  return definitions
}

export function getBlockDefinition(type: BlockTypeId): BlockDefinition | undefined {
  return definitions.find((d) => d.type === type)
}
