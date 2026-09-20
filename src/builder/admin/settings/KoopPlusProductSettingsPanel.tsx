import { AddItemButton, ImageUrlField, TextAreaField, TextField, ToggleField } from '@/builder/admin/ui/FormFields'
import { SettingsAccordion } from '@/builder/admin/ui/SettingsAccordion'
import { SharedAdvancedSection, wrapSections } from '@/builder/admin/settings/SharedSections'
import { useSelectedBlock } from '@/builder/admin/settings/useSelectedBlock'
import {
  patchKoopPlusProductContent,
  type KoopPlusProductBlock,
  type KoopPlusProductContent,
} from '@/builder/types/koopplusProduct'

export function KoopPlusProductSettingsPanel() {
  const { block, update } = useSelectedBlock<KoopPlusProductBlock>()
  if (!block || block.type !== 'koopplus-product') return null

  const content = block.settings.content
  const setContent = (patch: (current: KoopPlusProductContent) => KoopPlusProductContent) => {
    update(patchKoopPlusProductContent(block, patch))
  }

  const items = wrapSections([
    {
      id: 'hero',
      title: 'Hero',
      defaultOpen: true,
      content: (
        <>
          <TextField
            label="Rozet / eyebrow"
            value={content.hero.kicker}
            onChange={(kicker) => setContent((current) => ({ ...current, hero: { ...current.hero, kicker } }))}
          />
          <TextField
            label="Kimlik / alt başlık"
            value={content.hero.identity}
            onChange={(identity) => setContent((current) => ({ ...current, hero: { ...current.hero, identity } }))}
          />
          <TextField
            label="Başlık"
            value={content.hero.title}
            onChange={(title) => setContent((current) => ({ ...current, hero: { ...current.hero, title } }))}
          />
          <TextAreaField
            label="Açıklama"
            value={content.hero.description}
            onChange={(description) =>
              setContent((current) => ({ ...current, hero: { ...current.hero, description } }))
            }
            rows={4}
          />
          <TextField
            label="Birincil CTA"
            hint="Etiket değişir; Windows satın alma aksiyonu sabit kalır"
            value={content.hero.primaryCtaLabel}
            onChange={(primaryCtaLabel) =>
              setContent((current) => ({ ...current, hero: { ...current.hero, primaryCtaLabel } }))
            }
          />
          <TextField
            label="İkincil CTA"
            hint="Etiket değişir; deneme aksiyonu sabit kalır"
            value={content.hero.secondaryCtaLabel}
            onChange={(secondaryCtaLabel) =>
              setContent((current) => ({ ...current, hero: { ...current.hero, secondaryCtaLabel } }))
            }
          />
          <TextField
            label="Satış kapalı etiketi"
            value={content.hero.salesNotReadyLabel}
            onChange={(salesNotReadyLabel) =>
              setContent((current) => ({ ...current, hero: { ...current.hero, salesNotReadyLabel } }))
            }
          />
          <ImageUrlField
            label="Hero görseli"
            hint="Boş bırakılırsa ürün galerisi veya marka ikonu kullanılır"
            value={content.hero.imageUrl ?? ''}
            onChange={(imageUrl) =>
              setContent((current) => ({
                ...current,
                hero: { ...current.hero, imageUrl: imageUrl.trim() || null },
              }))
            }
          />
          <TextField
            label="Hero görsel alt metni"
            value={content.hero.imageAlt}
            onChange={(imageAlt) => setContent((current) => ({ ...current, hero: { ...current.hero, imageAlt } }))}
          />
        </>
      ),
    },
    {
      id: 'windows',
      title: 'Windows',
      content: (
        <>
          <TextField
            label="Bölüm başlığı"
            value={content.platforms.heading}
            onChange={(heading) =>
              setContent((current) => ({ ...current, platforms: { ...current.platforms, heading } }))
            }
          />
          <TextField
            label="Deneme satır eki"
            value={content.platforms.trialSuffix}
            onChange={(trialSuffix) =>
              setContent((current) => ({ ...current, platforms: { ...current.platforms, trialSuffix } }))
            }
          />
          <TextField
            label="Kart başlığı"
            value={content.platforms.windows.title}
            onChange={(title) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, windows: { ...current.platforms.windows, title } },
              }))
            }
          />
          <TextField
            label="Durum"
            value={content.platforms.windows.status}
            onChange={(status) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, windows: { ...current.platforms.windows, status } },
              }))
            }
          />
          <TextField
            label="Rozet"
            value={content.platforms.windows.badge}
            onChange={(badge) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, windows: { ...current.platforms.windows, badge } },
              }))
            }
          />
          <TextField
            label="Satın al CTA"
            hint="Etiket değişir; purchaseWindows aksiyonu sabit kalır"
            value={content.platforms.windows.purchaseCtaLabel}
            onChange={(purchaseCtaLabel) =>
              setContent((current) => ({
                ...current,
                platforms: {
                  ...current.platforms,
                  windows: { ...current.platforms.windows, purchaseCtaLabel },
                },
              }))
            }
          />
          <TextField
            label="Deneme CTA"
            value={content.platforms.windows.trialCtaLabel}
            onChange={(trialCtaLabel) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, windows: { ...current.platforms.windows, trialCtaLabel } },
              }))
            }
          />
        </>
      ),
    },
    {
      id: 'mac',
      title: 'Mac',
      content: (
        <>
          <TextField
            label="Kart başlığı"
            value={content.platforms.mac.title}
            onChange={(title) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, mac: { ...current.platforms.mac, title } },
              }))
            }
          />
          <TextAreaField
            label="Açıklama"
            value={content.platforms.mac.status}
            onChange={(status) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, mac: { ...current.platforms.mac, status } },
              }))
            }
          />
          <TextField
            label="Rozet / YAKINDA metni"
            value={content.platforms.mac.badge}
            onChange={(badge) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, mac: { ...current.platforms.mac, badge } },
              }))
            }
          />
          <TextField
            label="Satın al CTA"
            hint="Etiket değişir; macOS feature flag satın almayı açamaz"
            value={content.platforms.mac.purchaseCtaLabel}
            onChange={(purchaseCtaLabel) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, mac: { ...current.platforms.mac, purchaseCtaLabel } },
              }))
            }
          />
          <TextField
            label="Kapalı notu"
            value={content.platforms.mac.closedNote}
            onChange={(closedNote) =>
              setContent((current) => ({
                ...current,
                platforms: { ...current.platforms, mac: { ...current.platforms.mac, closedNote } },
              }))
            }
          />
        </>
      ),
    },
    {
      id: 'trial',
      title: 'Deneme',
      content: (
        <>
          <ToggleField
            label="Bölümü göster"
            checked={content.sectionVisibility.trial}
            onChange={(trial) =>
              setContent((current) => ({
                ...current,
                sectionVisibility: { ...current.sectionVisibility, trial },
              }))
            }
          />
          <TextField
            label="Eyebrow"
            value={content.trial.eyebrow}
            onChange={(eyebrow) => setContent((current) => ({ ...current, trial: { ...current.trial, eyebrow } }))}
          />
          <TextField
            label="Başlık"
            value={content.trial.title}
            onChange={(title) => setContent((current) => ({ ...current, trial: { ...current.trial, title } }))}
          />
          <TextAreaField
            label="Açıklama"
            value={content.trial.intro}
            onChange={(intro) => setContent((current) => ({ ...current, trial: { ...current.trial, intro } }))}
          />
          <TextField
            label="İndir CTA"
            hint="Etiket değişir; indirme URL’si sistem kaynağından gelir"
            value={content.trial.downloadCtaLabel}
            onChange={(downloadCtaLabel) =>
              setContent((current) => ({ ...current, trial: { ...current.trial, downloadCtaLabel } }))
            }
          />
          <TextField
            label="Güven satırı"
            value={content.trial.trustLine}
            onChange={(trustLine) =>
              setContent((current) => ({ ...current, trial: { ...current.trial, trustLine } }))
            }
          />
          <TextField
            label="İndirme notu"
            value={content.trial.downloadHint}
            onChange={(downloadHint) =>
              setContent((current) => ({ ...current, trial: { ...current.trial, downloadHint } }))
            }
          />
          {content.trial.highlights.map((item, index) => (
            <div key={`trial-highlight-${index}`} className="space-y-2 rounded-lg border border-slate-100 p-3">
              <TextField
                label={`Vurgu ${index + 1} başlık`}
                value={item.title}
                onChange={(title) =>
                  setContent((current) => ({
                    ...current,
                    trial: {
                      ...current.trial,
                      highlights: current.trial.highlights.map((row, i) => (i === index ? { ...row, title } : row)),
                    },
                  }))
                }
              />
              <TextAreaField
                label={`Vurgu ${index + 1} açıklama`}
                value={item.description}
                onChange={(description) =>
                  setContent((current) => ({
                    ...current,
                    trial: {
                      ...current.trial,
                      highlights: current.trial.highlights.map((row, i) =>
                        i === index ? { ...row, description } : row,
                      ),
                    },
                  }))
                }
              />
            </div>
          ))}
        </>
      ),
    },
    {
      id: 'gallery',
      title: 'Galeri',
      content: (
        <>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Boş bırakılırsa Product API galerisi kullanılır. Medya kütüphanesinden seçilen görseller bloğa yazılır.
          </p>
          {content.gallery.images.map((image, index) => (
            <div key={`gallery-${index}`} className="space-y-2 rounded-lg border border-slate-100 p-3">
              <ImageUrlField
                label={`Görsel ${index + 1}`}
                value={image.url}
                onChange={(url) =>
                  setContent((current) => ({
                    ...current,
                    gallery: {
                      images: current.gallery.images.map((row, i) => (i === index ? { ...row, url } : row)),
                    },
                  }))
                }
              />
              <TextField
                label="Alt metin"
                value={image.alt}
                onChange={(alt) =>
                  setContent((current) => ({
                    ...current,
                    gallery: {
                      images: current.gallery.images.map((row, i) => (i === index ? { ...row, alt } : row)),
                    },
                  }))
                }
              />
              <button
                type="button"
                className="text-xs font-medium text-slate-500 hover:text-red-600"
                onClick={() =>
                  setContent((current) => ({
                    ...current,
                    gallery: { images: current.gallery.images.filter((_, i) => i !== index) },
                  }))
                }
              >
                Görseli kaldır
              </button>
            </div>
          ))}
          <AddItemButton
            onClick={() =>
              setContent((current) => ({
                ...current,
                gallery: { images: [...current.gallery.images, { url: '', alt: '' }] },
              }))
            }
          >
            Görsel ekle
          </AddItemButton>
        </>
      ),
    },
    {
      id: 'features',
      title: 'Özellikler',
      content: (
        <>
          <ToggleField
            label="Bölümü göster"
            checked={content.sectionVisibility.features}
            onChange={(features) =>
              setContent((current) => ({
                ...current,
                sectionVisibility: { ...current.sectionVisibility, features },
              }))
            }
          />
          <TextField
            label="Başlık"
            value={content.features.heading}
            onChange={(heading) =>
              setContent((current) => ({ ...current, features: { ...current.features, heading } }))
            }
          />
          <TextAreaField
            label="Açıklama"
            value={content.features.description}
            onChange={(description) =>
              setContent((current) => ({ ...current, features: { ...current.features, description } }))
            }
          />
          {content.features.items.map((item, index) => (
            <div key={`feature-${index}`} className="space-y-2 rounded-lg border border-slate-100 p-3">
              <TextField
                label={`Özellik ${index + 1} başlık`}
                value={item.title}
                onChange={(title) =>
                  setContent((current) => ({
                    ...current,
                    features: {
                      ...current.features,
                      items: current.features.items.map((row, i) => (i === index ? { ...row, title } : row)),
                    },
                  }))
                }
              />
              <TextAreaField
                label={`Özellik ${index + 1} açıklama`}
                value={item.description}
                onChange={(description) =>
                  setContent((current) => ({
                    ...current,
                    features: {
                      ...current.features,
                      items: current.features.items.map((row, i) => (i === index ? { ...row, description } : row)),
                    },
                  }))
                }
              />
            </div>
          ))}
        </>
      ),
    },
    {
      id: 'why',
      title: 'Neden KoopPlus',
      content: (
        <>
          <ToggleField
            label="Bölümü göster"
            checked={content.sectionVisibility.why}
            onChange={(why) =>
              setContent((current) => ({
                ...current,
                sectionVisibility: { ...current.sectionVisibility, why },
              }))
            }
          />
          <TextField
            label="Başlık"
            value={content.why.heading}
            onChange={(heading) => setContent((current) => ({ ...current, why: { ...current.why, heading } }))}
          />
          {content.why.items.map((item, index) => (
            <div key={`why-${index}`} className="space-y-2 rounded-lg border border-slate-100 p-3">
              <TextField
                label={`Madde ${index + 1} başlık`}
                value={item.title}
                onChange={(title) =>
                  setContent((current) => ({
                    ...current,
                    why: {
                      ...current.why,
                      items: current.why.items.map((row, i) => (i === index ? { ...row, title } : row)),
                    },
                  }))
                }
              />
              <TextAreaField
                label={`Madde ${index + 1} açıklama`}
                value={item.description}
                onChange={(description) =>
                  setContent((current) => ({
                    ...current,
                    why: {
                      ...current.why,
                      items: current.why.items.map((row, i) => (i === index ? { ...row, description } : row)),
                    },
                  }))
                }
              />
            </div>
          ))}
        </>
      ),
    },
    {
      id: 'info',
      title: 'Çoklu kooperatif / yerel veri',
      content: (
        <>
          <ToggleField
            label="Bölümü göster"
            checked={content.sectionVisibility.info}
            onChange={(info) =>
              setContent((current) => ({
                ...current,
                sectionVisibility: { ...current.sectionVisibility, info },
              }))
            }
          />
          <TextField
            label="Çoklu kooperatif başlığı"
            value={content.info.multiCoop.title}
            onChange={(title) =>
              setContent((current) => ({
                ...current,
                info: { ...current.info, multiCoop: { ...current.info.multiCoop, title } },
              }))
            }
          />
          <TextAreaField
            label="Çoklu kooperatif açıklaması"
            value={content.info.multiCoop.description}
            onChange={(description) =>
              setContent((current) => ({
                ...current,
                info: { ...current.info, multiCoop: { ...current.info.multiCoop, description } },
              }))
            }
          />
          <TextField
            label="Yerel veri başlığı"
            value={content.info.localData.title}
            onChange={(title) =>
              setContent((current) => ({
                ...current,
                info: { ...current.info, localData: { ...current.info.localData, title } },
              }))
            }
          />
          <TextAreaField
            label="Yerel veri açıklaması"
            value={content.info.localData.description}
            onChange={(description) =>
              setContent((current) => ({
                ...current,
                info: { ...current.info, localData: { ...current.info.localData, description } },
              }))
            }
          />
        </>
      ),
    },
    {
      id: 'license',
      title: 'Lisans metinleri',
      content: (
        <>
          <ToggleField
            label="Bölümü göster"
            checked={content.sectionVisibility.license}
            onChange={(license) =>
              setContent((current) => ({
                ...current,
                sectionVisibility: { ...current.sectionVisibility, license },
              }))
            }
          />
          <TextField
            label="Başlık"
            value={content.license.heading}
            onChange={(heading) =>
              setContent((current) => ({ ...current, license: { ...current.license, heading } }))
            }
          />
          {content.license.points.map((point, index) => (
            <TextField
              key={`license-${index}`}
              label={`Madde ${index + 1}`}
              value={point}
              onChange={(value) =>
                setContent((current) => ({
                  ...current,
                  license: {
                    ...current.license,
                    points: current.license.points.map((row, i) => (i === index ? value : row)),
                  },
                }))
              }
            />
          ))}
        </>
      ),
    },
    {
      id: 'faq',
      title: 'SSS',
      content: (
        <>
          <ToggleField
            label="Bölümü göster"
            checked={content.sectionVisibility.faq}
            onChange={(faq) =>
              setContent((current) => ({
                ...current,
                sectionVisibility: { ...current.sectionVisibility, faq },
              }))
            }
          />
          <TextField
            label="Başlık"
            value={content.faq.heading}
            onChange={(heading) => setContent((current) => ({ ...current, faq: { ...current.faq, heading } }))}
          />
          {content.faq.items.map((item, index) => (
            <div key={`faq-${index}`} className="space-y-2 rounded-lg border border-slate-100 p-3">
              <TextField
                label={`Soru ${index + 1}`}
                value={item.question}
                onChange={(question) =>
                  setContent((current) => ({
                    ...current,
                    faq: {
                      ...current.faq,
                      items: current.faq.items.map((row, i) => (i === index ? { ...row, question } : row)),
                    },
                  }))
                }
              />
              <TextAreaField
                label={`Cevap ${index + 1}`}
                value={item.answer}
                onChange={(answer) =>
                  setContent((current) => ({
                    ...current,
                    faq: {
                      ...current.faq,
                      items: current.faq.items.map((row, i) => (i === index ? { ...row, answer } : row)),
                    },
                  }))
                }
              />
            </div>
          ))}
        </>
      ),
    },
    {
      id: 'closing',
      title: 'Kapanış CTA',
      content: (
        <>
          <ToggleField
            label="Bölümü göster"
            checked={content.sectionVisibility.closing}
            onChange={(closing) =>
              setContent((current) => ({
                ...current,
                sectionVisibility: { ...current.sectionVisibility, closing },
              }))
            }
          />
          <TextField
            label="Başlık"
            value={content.closing.heading}
            onChange={(heading) =>
              setContent((current) => ({ ...current, closing: { ...current.closing, heading } }))
            }
          />
          <TextAreaField
            label="Açıklama"
            value={content.closing.description}
            onChange={(description) =>
              setContent((current) => ({ ...current, closing: { ...current.closing, description } }))
            }
          />
          <TextField
            label="Birincil CTA"
            value={content.closing.primaryCtaLabel}
            onChange={(primaryCtaLabel) =>
              setContent((current) => ({ ...current, closing: { ...current.closing, primaryCtaLabel } }))
            }
          />
          <TextField
            label="İkincil CTA"
            value={content.closing.secondaryCtaLabel}
            onChange={(secondaryCtaLabel) =>
              setContent((current) => ({ ...current, closing: { ...current.closing, secondaryCtaLabel } }))
            }
          />
        </>
      ),
    },
    {
      id: 'advanced',
      title: 'Gelişmiş',
      content: <SharedAdvancedSection block={block} onChange={update} />,
    },
  ])

  return <SettingsAccordion items={items} />
}
