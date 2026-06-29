import { useMemo } from 'react'

import { useBuilderStore } from '@/builder/store/builderStore'

import { blockTypeLabel } from '@/builder/admin/BlockLibraryPanel'

import { resolveFieldFocus, resolveFieldLabel } from '@/builder/edit/fieldFocus'

import { SettingsFocusProvider } from '@/builder/edit/SettingsFocusContext'

import { HeroSettingsPanel } from '@/builder/admin/settings/HeroSettingsPanel'

import { CtaSettingsPanel } from '@/builder/admin/settings/CtaSettingsPanel'

import { CardGridSettingsPanel } from '@/builder/admin/settings/CardGridSettingsPanel'

import { FaqSettingsPanel } from '@/builder/admin/settings/FaqSettingsPanel'

import { ProductsShowcaseSettingsPanel } from '@/builder/admin/settings/ProductsShowcaseSettingsPanel'

import { BlogShowcaseSettingsPanel } from '@/builder/admin/settings/BlogShowcaseSettingsPanel'

import { ServicesShowcaseSettingsPanel } from '@/builder/admin/settings/ServicesShowcaseSettingsPanel'

import {

  ImageTextSettingsPanel,

  RichTextSettingsPanel,

} from '@/builder/admin/settings/ContentBlockSettingsPanels'
import { LegacySectionSettingsPanel } from '@/builder/admin/settings/LegacySectionSettingsPanel'
import { ProductDetailSettingsPanel } from '@/builder/admin/settings/ProductDetailSettingsPanel'
import { BlogArticleSettingsPanel } from '@/builder/admin/settings/BlogArticleSettingsPanel'

export function BlockSettingsPanel() {
  const canvasMode = useBuilderStore((s) => s.canvasMode)

  const blocks = useBuilderStore((s) => s.blocks)

  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId)

  const selectedFieldPath = useBuilderStore((s) => s.selectedFieldPath)

  const convertToBuilderDraft = useBuilderStore((s) => s.convertToBuilderDraft)



  const isEditable = canvasMode === 'builder-blocks'



  const block = useMemo(

    () => blocks.find((b) => b.id === selectedBlockId) ?? null,

    [blocks, selectedBlockId],

  )



  const focusTarget = useMemo(

    () => resolveFieldFocus(block, selectedFieldPath),

    [block, selectedFieldPath],

  )



  const fieldBreadcrumb = selectedFieldPath ? resolveFieldLabel(selectedFieldPath) : null



  if (!isEditable) {

    return (

      <aside className="flex w-full shrink-0 flex-col border-t border-slate-200 bg-white lg:h-full lg:min-h-0 lg:w-[340px] lg:overflow-hidden lg:border-l lg:border-t-0">

        <div className="shrink-0 border-b border-slate-100 px-4 py-3">

          <h2 className="text-sm font-semibold text-slate-900">Blok ayarları</h2>

          <p className="mt-0.5 text-xs text-amber-700">Legacy sayfa — düzenleme kapalı</p>

        </div>

        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">

          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-6 py-8">

            <p className="text-sm font-medium text-amber-950">Düzenleme yapılamaz</p>

            <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-amber-900/80">

              Bu sayfa henüz builder formatına dönüştürülmemiş. Düzenlemek için builder taslağına

              dönüştürün.

            </p>

            <button

              type="button"

              onClick={convertToBuilderDraft}

              className="mt-4 rounded-lg bg-amber-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-950"

            >

              Builder&apos;a dönüştür

            </button>

          </div>

        </div>

      </aside>

    )

  }



  return (

    <aside className="flex w-full shrink-0 flex-col border-t border-slate-200 bg-white lg:h-full lg:min-h-0 lg:w-[340px] lg:overflow-hidden lg:border-l lg:border-t-0">

      <div className="shrink-0 border-b border-slate-100 px-4 py-3">

        <h2 className="text-sm font-semibold text-slate-900">Blok ayarları</h2>

        {block ? (

          <>

            <p className="mt-0.5 text-xs text-slate-500">{blockTypeLabel(block.type)}</p>

            {fieldBreadcrumb ? (

              <p className="mt-1 text-xs font-medium text-violet-600">

                {blockTypeLabel(block.type)} › {fieldBreadcrumb}

              </p>

            ) : null}

          </>

        ) : (

          <p className="mt-0.5 text-xs text-slate-400">Canvas&apos;ta bir blok veya alan seçin</p>

        )}

      </div>



      {!block ? (

        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">

          <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-8">

            <p className="text-sm font-medium text-slate-600">Henüz seçim yok</p>

            <p className="mt-1 max-w-[220px] text-xs leading-relaxed text-slate-400">

              Orta alanda bir bloğa veya alana (ör. Hero başlığı) tıklayın. Sağ panelde ilgili input

              açılır; değişiklikler canvas&apos;a anında yansır.

            </p>

          </div>

        </div>

      ) : (

        <div className="min-h-0 flex-1 overflow-y-auto">

          <SettingsFocusProvider focusTarget={focusTarget}>

            <BlockSettingsRouter type={block.type} />

          </SettingsFocusProvider>

        </div>

      )}

    </aside>

  )

}



function BlockSettingsRouter({ type }: { type: string }) {

  switch (type) {

    case 'hero':

      return <HeroSettingsPanel />

    case 'cta':

      return <CtaSettingsPanel />

    case 'card-grid':

      return <CardGridSettingsPanel />

    case 'faq':

      return <FaqSettingsPanel />

    case 'products-showcase':

      return <ProductsShowcaseSettingsPanel />

    case 'blog-showcase':

      return <BlogShowcaseSettingsPanel />

    case 'services-showcase':

      return <ServicesShowcaseSettingsPanel />

    case 'rich-text':

      return <RichTextSettingsPanel />

    case 'image-text':

      return <ImageTextSettingsPanel />

    case 'legacy-section':

      return <LegacySectionSettingsPanel />

    case 'product-detail':

      return <ProductDetailSettingsPanel />

    case 'blog-article':

      return <BlogArticleSettingsPanel />

    default:

      return (

        <p className="p-4 text-xs text-slate-500">Bu blok tipi için ayar paneli henüz hazırlanmadı.</p>

      )

  }

}


