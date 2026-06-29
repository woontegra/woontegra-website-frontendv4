import { useState } from 'react'
import { SettingsAccordion, CollapsibleItem } from '@/builder/admin/ui/SettingsAccordion'
import {
  AddItemButton,
  ImageUrlField,
  RadioCardGroup,
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
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import { useFocusCollapsible } from '@/builder/admin/settings/useFocusCollapsible'
import type { BlockButton, HeroBlock, HeroHighlight, HeroMode, HeroSlide } from '@/builder/types'
import { createDefaultHeroSlide } from '@/builder/types'

const HERO_MODE_OPTIONS = [
  { value: 'single-image', label: 'Tek Görsel', description: 'Tek arka plan görseli' },
  { value: 'carousel', label: 'Carousel', description: 'Birden fazla slayt' },
  { value: 'video', label: 'Video', description: 'Arka plan video' },
  { value: 'gradient', label: 'Gradient', description: 'İki renk geçişi' },
  { value: 'solid-color', label: 'Sadece Renk', description: 'Düz arka plan rengi' },
]

export function HeroSettingsPanel() {
  const { block, update } = useSelectedBlock<HeroBlock>()
  const [openHighlightId, setOpenHighlightId] = useState<string | null>(null)
  useFocusCollapsible(setOpenHighlightId)
  if (!block) return null

  const { settings, style, visibility } = block
  const setSettings = (patch: Partial<HeroBlock['settings']>) =>
    update({ ...block, settings: { ...settings, ...patch } })

  const highlights = settings.highlights ?? []
  const updateHighlight = (id: string, patch: Partial<HeroHighlight>) => {
    setSettings({
      highlights: highlights.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    })
  }

  const items = wrapSections([
    {
      id: 'content',
      title: 'İçerik',
      description: 'Başlık ve görünürlük',
      defaultOpen: true,
      content: (
        <>
          <SharedContentSection block={block} onChange={update} />
          <TextField
            label="Badge"
            hint="Hero üst etiketi"
            settingsFieldId="badge"
            value={settings.badge ?? ''}
            onChange={(badge) => setSettings({ badge })}
          />
          <SelectField
            label="Yerleşim"
            value={settings.layout ?? 'centered'}
            onChange={(v) => setSettings({ layout: v as HeroBlock['settings']['layout'] })}
            options={[
              { value: 'centered', label: 'Ortalanmış (klasik)' },
              { value: 'split', label: 'Split (metin + görsel)' },
              { value: 'about', label: 'Hakkımızda (PageHero)' },
              { value: 'compact', label: 'Compact (detay sayfa)' },
            ]}
          />
          <ToggleField
            label="Badge göster"
            checked={visibility.showBadge !== false}
            onChange={(showBadge) =>
              update({ ...block, visibility: { ...visibility, showBadge } })
            }
          />
          {settings.layout === 'about' ? (
            <ToggleField
              label="Breadcrumb göster"
              checked={settings.showBreadcrumbs !== false}
              onChange={(showBreadcrumbs) => setSettings({ showBreadcrumbs })}
            />
          ) : null}
          <SelectField
            label="Yazı hizası"
            value={settings.contentAlign ?? 'left'}
            onChange={(v) => setSettings({ contentAlign: v as HeroBlock['settings']['contentAlign'] })}
            options={[
              { value: 'left', label: 'Sol' },
              { value: 'center', label: 'Orta' },
              { value: 'right', label: 'Sağ' },
            ]}
          />
          <SelectField
            label="İçerik konumu"
            hint="Metin bloğunun yatay konumu"
            value={settings.contentPosition ?? 'left'}
            onChange={(v) => setSettings({ contentPosition: v as HeroBlock['settings']['contentPosition'] })}
            options={[
              { value: 'left', label: 'Sol' },
              { value: 'center', label: 'Orta' },
              { value: 'right', label: 'Sağ' },
            ]}
          />
        </>
      ),
    },
    {
      id: 'media',
      title: 'Görseller',
      description: 'Hero tipine göre medya ayarları',
      content: (
        <>
          <RadioCardGroup
            label="Hero tipi"
            value={settings.mode}
            onChange={(v) => setSettings({ mode: v as HeroMode })}
            options={HERO_MODE_OPTIONS}
          />
          {settings.mode === 'single-image' ? (
            <SingleImageFields block={block} onChange={update} />
          ) : null}
          {settings.mode === 'carousel' ? (
            <CarouselSlidesEditor block={block} onChange={update} />
          ) : null}
          {settings.mode === 'gradient' ? (
            <GradientFields block={block} onChange={update} />
          ) : null}
          {settings.mode === 'video' ? <VideoFields block={block} onChange={update} /> : null}
          {settings.mode === 'solid-color' ? (
            <TextField
              label="Arka plan rengi"
              hint="Hero tamamen bu renkle doldurulur"
              value={style.backgroundColor ?? '#0f172a'}
              onChange={(backgroundColor) =>
                update({ ...block, style: { ...style, backgroundColor } })
              }
            />
          ) : null}
        </>
      ),
    },
    {
      id: 'highlights',
      title: 'Hero kartları',
      description: settings.layout === 'about' ? `${highlights.length} vurgu kartı` : 'About layout için',
      content:
        settings.layout === 'about' ? (
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <CollapsibleItem
                key={h.id}
                title={`Kart ${i + 1}`}
                subtitle={h.title || 'Başlıksız'}
                open={openHighlightId === h.id}
                onToggle={() => setOpenHighlightId(openHighlightId === h.id ? null : h.id)}
              >
                <TextField
                  label="Başlık"
                  settingsFieldId={`highlight-${h.id}-title`}
                  value={h.title}
                  onChange={(title) => updateHighlight(h.id, { title })}
                />
                <TextField
                  label="İkon"
                  hint="Lucide ikon adı"
                  value={h.icon}
                  onChange={(icon) => updateHighlight(h.id, { icon })}
                />
                <TextField
                  label="Kart sınıfı"
                  hint="Tailwind gradient/border sınıfları"
                  value={h.cardClass ?? ''}
                  onChange={(cardClass) => updateHighlight(h.id, { cardClass })}
                />
                <TextField
                  label="İkon rengi"
                  value={h.iconClass ?? ''}
                  onChange={(iconClass) => updateHighlight(h.id, { iconClass })}
                />
              </CollapsibleItem>
            ))}
            <AddItemButton
              onClick={() => {
                const id = `highlight-${Date.now()}`
                setSettings({
                  highlights: [
                    ...highlights,
                    {
                      id,
                      icon: 'sparkles',
                      title: 'Yeni kart',
                      cardClass: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20',
                      iconClass: 'text-emerald-400',
                    },
                  ],
                })
                setOpenHighlightId(id)
              }}
            >
              Kart ekle
            </AddItemButton>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Hero kartları yalnızca Hakkımızda yerleşiminde kullanılır.</p>
        ),
    },
    {
      id: 'buttons',
      title: 'Butonlar',
      description: 'Global hero butonları (tek görsel modu)',
      content: (
        <HeroGlobalButtons block={block} onChange={update} showToggle={settings.mode !== 'carousel'} />
      ),
    },
    {
      id: 'design',
      title: 'Tasarım',
      content: (
        <>
          <SharedDesignSection block={block} onChange={update} />
          <ToggleField
            label="Overlay"
            hint="Görsel/video üzerinde koyu katman"
            checked={style.overlay?.enabled ?? false}
            onChange={(enabled) =>
              update({
                ...block,
                style: {
                  ...style,
                  overlay: { enabled, color: style.overlay?.color ?? '#000', opacity: style.overlay?.opacity ?? 0.4 },
                },
              })
            }
          />
          {style.overlay?.enabled ? (
            <>
              <TextField
                label="Overlay rengi"
                value={style.overlay?.color ?? '#000000'}
                onChange={(color) =>
                  update({
                    ...block,
                    style: { ...style, overlay: { ...style.overlay!, color } },
                  })
                }
              />
              <TextField
                label="Overlay opaklık"
                value={String(style.overlay?.opacity ?? 0.4)}
                onChange={(v) =>
                  update({
                    ...block,
                    style: {
                      ...style,
                      overlay: { ...style.overlay!, opacity: Number(v) || 0 },
                    },
                  })
                }
              />
            </>
          ) : null}
          <ToggleField
            label="Butonları göster"
            checked={visibility.showButton !== false}
            onChange={(showButton) =>
              update({ ...block, visibility: { ...visibility, showButton } })
            }
          />
        </>
      ),
    },
    {
      id: 'responsive',
      title: 'Responsive',
      description: 'Yükseklik ve boşluklar',
      content: (
        <>
          <TextField
            label="Desktop yükseklik"
            value={settings.height?.desktop ?? ''}
            onChange={(desktop) => setSettings({ height: { ...settings.height, desktop } })}
            placeholder="520px"
          />
          <TextField
            label="Tablet yükseklik"
            value={settings.height?.tablet ?? ''}
            onChange={(tablet) => setSettings({ height: { ...settings.height, tablet } })}
            placeholder="440px"
          />
          <TextField
            label="Mobil yükseklik"
            value={settings.height?.mobile ?? ''}
            onChange={(mobile) => setSettings({ height: { ...settings.height, mobile } })}
            placeholder="360px"
          />
          <SharedResponsiveSection block={block} onChange={update} />
        </>
      ),
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: (
        <>
          <SharedAdvancedSection block={block} onChange={update} />
          <ToggleField
            label="Tam ekran"
            checked={settings.fullscreen ?? false}
            onChange={(fullscreen) => setSettings({ fullscreen })}
          />
        </>
      ),
    },
  ])

  return <SettingsAccordion items={items} />
}

function SingleImageFields({
  block,
  onChange,
}: {
  block: HeroBlock
  onChange: (b: HeroBlock) => void
}) {
  const { settings, style } = block
  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <ImageUrlField
        label="Desktop görsel"
        settingsFieldId="desktop-image"
        uploadFolder="hero"
        value={settings.desktopImage?.url ?? ''}
        onChange={(url) =>
          onChange({
            ...block,
            settings: { ...settings, desktopImage: { ...settings.desktopImage, url } },
          })
        }
      />
      <ImageUrlField
        label="Tablet görsel"
        hint="Boş bırakılırsa desktop kullanılır"
        uploadFolder="hero"
        value={settings.tabletImage?.url ?? ''}
        onChange={(url) =>
          onChange({
            ...block,
            settings: { ...settings, tabletImage: { ...settings.tabletImage, url } },
          })
        }
      />
      <ImageUrlField
        label="Mobil görsel"
        uploadFolder="hero"
        value={settings.mobileImage?.url ?? ''}
        onChange={(url) =>
          onChange({
            ...block,
            settings: { ...settings, mobileImage: { ...settings.mobileImage, url } },
          })
        }
      />
      <TextField
        label="Yükseklik (desktop)"
        value={settings.height?.desktop ?? ''}
        onChange={(desktop) =>
          onChange({ ...block, settings: { ...settings, height: { ...settings.height, desktop } } })
        }
      />
      <ToggleField
        label="Overlay"
        checked={style.overlay?.enabled ?? false}
        onChange={(enabled) =>
          onChange({
            ...block,
            style: {
              ...style,
              overlay: { enabled, color: '#000', opacity: 0.4 },
            },
          })
        }
      />
    </div>
  )
}

function GradientFields({
  block,
  onChange,
}: {
  block: HeroBlock
  onChange: (b: HeroBlock) => void
}) {
  const gs = block.settings.gradientStyle ?? {}
  const setGs = (patch: Partial<typeof gs>) =>
    onChange({
      ...block,
      settings: {
        ...block.settings,
        gradientStyle: { ...gs, ...patch },
        gradient: `linear-gradient(135deg, ${patch.color1 ?? gs.color1 ?? '#1e293b'}, ${patch.color2 ?? gs.color2 ?? '#065f46'})`,
      },
    })

  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <TextField
        label="Gradient 1"
        value={gs.color1 ?? '#1e293b'}
        onChange={(color1) => setGs({ color1 })}
      />
      <TextField
        label="Gradient 2"
        value={gs.color2 ?? '#065f46'}
        onChange={(color2) => setGs({ color2 })}
      />
      <TextField
        label="Opacity"
        value={String(gs.opacity ?? 1)}
        onChange={(v) => setGs({ opacity: Number(v) || 1 })}
      />
      <TextField
        label="Blur (px)"
        value={String(gs.blur ?? 0)}
        onChange={(v) => setGs({ blur: Number(v) || 0 })}
      />
      <ToggleField
        label="Noise efekti"
        checked={gs.noise ?? false}
        onChange={(noise) => setGs({ noise })}
      />
      <TextField
        label="Yükseklik"
        value={block.settings.height?.desktop ?? ''}
        onChange={(desktop) =>
          onChange({
            ...block,
            settings: { ...block.settings, height: { ...block.settings.height, desktop } },
          })
        }
      />
    </div>
  )
}

function VideoFields({
  block,
  onChange,
}: {
  block: HeroBlock
  onChange: (b: HeroBlock) => void
}) {
  const video = block.settings.video ?? {}
  const setVideo = (patch: Partial<typeof video>) =>
    onChange({ ...block, settings: { ...block.settings, video: { ...video, ...patch } } })

  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
      <TextField
        label="Video URL"
        hint="MP4 veya harici video adresi"
        value={video.videoUrl ?? ''}
        onChange={(videoUrl) => setVideo({ videoUrl })}
      />
      <ImageUrlField
        label="Poster görsel"
        uploadFolder="hero"
        value={video.posterUrl ?? ''}
        onChange={(posterUrl) => setVideo({ posterUrl })}
      />
      <ToggleField
        label="Overlay"
        checked={block.style.overlay?.enabled ?? false}
        onChange={(enabled) =>
          onChange({
            ...block,
            style: {
              ...block.style,
              overlay: { enabled, color: '#000', opacity: 0.4 },
            },
          })
        }
      />
      <ToggleField label="Sessiz başlat" checked={video.muted ?? true} onChange={(muted) => setVideo({ muted })} />
      <ToggleField label="Loop" checked={video.loop ?? true} onChange={(loop) => setVideo({ loop })} />
      <ToggleField label="Autoplay" checked={video.autoplay ?? true} onChange={(autoplay) => setVideo({ autoplay })} />
    </div>
  )
}

function CarouselSlidesEditor({
  block,
  onChange,
}: {
  block: HeroBlock
  onChange: (b: HeroBlock) => void
}) {
  const slides = [...block.settings.slides].sort((a, b) => a.sortOrder - b.sortOrder)
  const [openId, setOpenId] = useState<string | null>(slides[0]?.id ?? null)

  const updateSlide = (id: string, patch: Partial<HeroSlide>) => {
    onChange({
      ...block,
      settings: {
        ...block.settings,
        slides: block.settings.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      },
    })
  }

  const addSlide = () => {
    const next = createDefaultHeroSlide(slides.length)
    onChange({
      ...block,
      settings: { ...block.settings, slides: [...block.settings.slides, next] },
    })
    setOpenId(next.id)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500">Slide listesi — sıralama yakında sürükle-bırak ile gelecek.</p>
      {slides.map((slide, i) => (
        <CollapsibleItem
          key={slide.id}
          title={`Slide ${i + 1}`}
          subtitle={slide.title || 'Başlıksız slayt'}
          open={openId === slide.id}
          onToggle={() => setOpenId(openId === slide.id ? null : slide.id)}
          onRemove={
            slides.length > 1
              ? () =>
                  onChange({
                    ...block,
                    settings: {
                      ...block.settings,
                      slides: block.settings.slides.filter((s) => s.id !== slide.id),
                    },
                  })
              : undefined
          }
        >
          <ToggleField
            label="Aktif"
            checked={slide.enabled !== false}
            onChange={(enabled) => updateSlide(slide.id, { enabled })}
          />
          <TextField
            label="Başlık"
            value={slide.title ?? ''}
            onChange={(title) => updateSlide(slide.id, { title })}
          />
          <TextAreaField
            label="Açıklama"
            value={slide.description ?? ''}
            onChange={(description) => updateSlide(slide.id, { description })}
          />
          <SlideButtonFields slide={slide} index={0} label="Buton 1" onUpdate={updateSlide} />
          <SlideButtonFields slide={slide} index={1} label="Buton 2" onUpdate={updateSlide} />
          <ImageUrlField
            label="Desktop görsel"
            uploadFolder="hero"
            value={slide.desktopImage?.url ?? ''}
            onChange={(url) =>
              updateSlide(slide.id, { desktopImage: { ...slide.desktopImage, url } })
            }
          />
          <ImageUrlField
            label="Mobil görsel"
            uploadFolder="hero"
            value={slide.mobileImage?.url ?? ''}
            onChange={(url) =>
              updateSlide(slide.id, { mobileImage: { ...slide.mobileImage, url } })
            }
          />
          <ToggleField
            label="Overlay"
            checked={slide.overlay?.enabled ?? false}
            onChange={(enabled) =>
              updateSlide(slide.id, { overlay: { enabled, color: '#000', opacity: 0.4 } })
            }
          />
          <TextField
            label="Link"
            hint="Slayt tıklanınca gidilecek URL"
            value={slide.link ?? ''}
            onChange={(link) => updateSlide(slide.id, { link })}
          />
        </CollapsibleItem>
      ))}
      <AddItemButton onClick={addSlide}>Yeni Slide</AddItemButton>
    </div>
  )
}

function SlideButtonFields({
  slide,
  index,
  label,
  onUpdate,
}: {
  slide: HeroSlide
  index: number
  label: string
  onUpdate: (id: string, patch: Partial<HeroSlide>) => void
}) {
  const buttons = [...(slide.buttons ?? [])]
  while (buttons.length <= index) {
    buttons.push({ id: `btn-${index}`, label: '', href: '/', visible: false, variant: 'primary' })
  }
  const btn = buttons[index]

  const setBtn = (patch: Partial<BlockButton>) => {
    const next = [...buttons]
    next[index] = { ...btn, ...patch }
    onUpdate(slide.id, { buttons: next })
  }

  return (
    <div className="rounded-lg border border-slate-100 p-2">
      <p className="mb-2 text-xs font-medium text-slate-600">{label}</p>
      <ToggleField label="Göster" checked={btn.visible !== false} onChange={(visible) => setBtn({ visible })} />
      <TextField label="Metin" value={btn.label ?? ''} onChange={(label) => setBtn({ label })} />
      <TextField label="Link" value={btn.href ?? ''} onChange={(href) => setBtn({ href })} />
    </div>
  )
}

function HeroGlobalButtons({
  block,
  onChange,
  showToggle,
}: {
  block: HeroBlock
  onChange: (b: HeroBlock) => void
  showToggle: boolean
}) {
  const buttons = [...(block.settings.buttons ?? [])]
  while (buttons.length < 2) {
    buttons.push({
      id: `btn-${buttons.length}`,
      label: buttons.length === 0 ? 'Keşfet' : 'İletişim',
      href: '/',
      visible: buttons.length === 0,
      variant: buttons.length === 0 ? 'primary' : 'outline',
    })
  }

  const renderBtn = (idx: number, label: string) => {
    const btn = buttons[idx]
    const setBtn = (patch: Partial<BlockButton>) => {
      const next = [...buttons]
      next[idx] = { ...btn, ...patch }
      onChange({ ...block, settings: { ...block.settings, buttons: next } })
    }
    return (
      <div key={idx} className="rounded-lg border border-slate-100 p-3" data-builder-settings-field={`button-${idx}`}>
        <p className="mb-2 text-xs font-medium text-slate-600">{label}</p>
        <ToggleField label="Göster" checked={btn.visible !== false} onChange={(visible) => setBtn({ visible })} />
        <TextField label="Metin" value={btn.label ?? ''} onChange={(label) => setBtn({ label })} />
        <TextField label="Link" value={btn.href ?? ''} onChange={(href) => setBtn({ href })} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {showToggle ? (
        <ToggleField
          label="Butonları göster"
          checked={block.visibility.showButton !== false}
          onChange={(showButton) =>
            onChange({ ...block, visibility: { ...block.visibility, showButton } })
          }
        />
      ) : null}
      {renderBtn(0, 'Buton 1')}
      {renderBtn(1, 'Buton 2')}
    </div>
  )
}
