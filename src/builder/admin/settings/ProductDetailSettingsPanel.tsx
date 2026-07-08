import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import {
  SelectField,
  TextAreaField,
  TextField,
  ToggleField,
} from '@/builder/admin/ui/FormFields'
import {
  SharedAdvancedSection,
  SharedContentSection,
  SharedDesignSection,
  SharedResponsiveSection,
  wrapSections,
} from '@/builder/admin/settings/SharedSections'
import { ProductDetailGallerySettings } from '@/builder/admin/settings/ProductDetailGallerySettings'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import type { ProductDetailBlock } from '@/builder/types/productDetail'
import type { ProductType } from '@/types/product'

export function ProductDetailSettingsPanel() {
  const { block, update } = useSelectedBlock<ProductDetailBlock>()
  if (!block) return null

  const { settings } = block
  const setSettings = (patch: Partial<ProductDetailBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })

  const items = wrapSections([
    {
      id: 'product',
      title: 'Ürün bilgisi',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <SelectField
            label="Ürün tipi"
            value={settings.productType}
            onChange={(v) => setSettings({ productType: v as ProductType })}
            options={[
              { value: 'DOWNLOAD', label: 'İndirilebilir' },
              { value: 'SAAS', label: 'SaaS' },
              { value: 'SERVICE', label: 'Hizmet' },
            ]}
          />
          <TextField label="Slug" value={settings.slug} onChange={(slug) => setSettings({ slug })} />
          <TextField
            label="Fiyat"
            value={String(settings.price)}
            onChange={(v) => setSettings({ price: Number(v) || 0 })}
          />
          <TextField label="Para birimi" value={settings.currency} onChange={(currency) => setSettings({ currency })} />
          <TextField label="Sürüm" value={settings.version} onChange={(version) => setSettings({ version })} />
          <ToggleField label="Fiyat göster" checked={settings.showPrice !== false} onChange={(showPrice) => setSettings({ showPrice })} />
          <ToggleField label="Sepete ekle göster" checked={settings.showAddToCart !== false} onChange={(showAddToCart) => setSettings({ showAddToCart })} />
          <ToggleField label="Yıl seçici" checked={settings.showYearSelector} onChange={(showYearSelector) => setSettings({ showYearSelector })} />
        </>
      ),
    },
    {
      id: 'media',
      title: 'Ürün galerisi',
      description: `${settings.gallery.filter((g) => g.url?.trim()).length} görsel`,
      content: <ProductDetailGallerySettings block={block} onChange={update} />,
    },
    {
      id: 'delivery',
      title: 'Teslimat & lisans',
      content: (
        <>
          <TextAreaField label="Dijital teslimat" value={settings.deliveryInfo} onChange={(deliveryInfo) => setSettings({ deliveryInfo })} />
          <TextAreaField
            label="Detaylı açıklama (HTML)"
            value={settings.longDescriptionHtml}
            onChange={(longDescriptionHtml) => setSettings({ longDescriptionHtml })}
          />
          <TextAreaField label="Lisans bilgisi" value={settings.licenseInfo} onChange={(licenseInfo) => setSettings({ licenseInfo })} />
          <TextAreaField label="Sistem gereksinimleri" value={settings.systemRequirements} onChange={(systemRequirements) => setSettings({ systemRequirements })} />
          <TextAreaField label="Destek notu" value={settings.supportNote} onChange={(supportNote) => setSettings({ supportNote })} />
        </>
      ),
    },
    {
      id: 'design',
      title: 'Tasarım',
      content: <SharedDesignSection block={block} onChange={update} />,
    },
    {
      id: 'responsive',
      title: 'Responsive',
      content: <SharedResponsiveSection block={block} onChange={update} />,
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: <SharedAdvancedSection block={block} onChange={update} />,
    },
  ])

  return <SettingsAccordion items={items} />
}
