import { fazlaMesaiRawData as raw } from './fazlaMesaiRawData'
import type { BuilderBlock } from '@/builder/types'
import type { BhModulePageContent } from '@/builder/types/bhModule'
import type { HeroBlock } from '@/builder/types/hero'
import type { RichTextBlock, CardGridBlock, CtaBlock } from '@/builder/types/blockModels'
import type { VideoEmbedBlock, CalloutBlock } from '@/builder/types/contentBlocks'

function baseVisibility() {
  return {
    enabled: true,
    showTitle: true,
    showDescription: true,
    showImage: true,
    showButton: true,
  }
}

function baseStyle() {
  return {
    containerWidth: 'default' as const,
    contentAlign: 'left' as const,
    paddingTop: { desktop: '48px', mobile: '32px' },
    paddingBottom: { desktop: '48px', mobile: '32px' },
  }
}

/**
 * Local/test fixture only — proves Builder can represent Fazla Mesai landing structure.
 * Does NOT write to production CMS or migrate live BH pages.
 */
export function buildFazlaMesaiBuilderBlocks(): BuilderBlock[] {
  const L = raw.landing
  let order = 0

  const hero: HeroBlock = {
    id: 'fixture-hero-fazla-mesai',
    type: 'hero',
    sortOrder: order++,
    title: L.title,
    description: L.intro,
    visibility: baseVisibility(),
    style: {
      ...baseStyle(),
      backgroundGradient: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #0f172a 100%)',
    },
    settings: {
      mode: 'gradient',
      layout: 'compact',
      badge: L.eyebrow,
      slides: [],
      buttons: [
        {
          id: 'fixture-hero-cta',
          label: 'Demo talep et',
          href: '/yazilimlar/bilirkisi-hesap',
          variant: 'primary',
          visible: true,
        },
        {
          id: 'fixture-hero-secondary',
          label: 'Modüllere dön',
          href: '/yazilimlar/bilirkisi-hesap/moduller',
          variant: 'outline',
          visible: true,
        },
      ],
    },
  }

  const article: RichTextBlock = {
    id: 'fixture-rich-article-fazla-mesai',
    type: 'rich-text',
    sortOrder: order++,
    title: '',
    description: '',
    visibility: { ...baseVisibility(), showTitle: false, showDescription: false },
    style: baseStyle(),
    settings: {
      body: L.articleHtml,
    },
  }

  const typesGrid: CardGridBlock = {
    id: 'fixture-cardgrid-types-fazla-mesai',
    type: 'card-grid',
    sortOrder: order++,
    title: L.moduleTypesTitle || '12 Hesaplama Türü',
    description: 'Fazla mesai alacağı için desteklenen hesaplama modelleri',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      columns: 4,
      cards: L.moduleTypes.map((card, i) => ({
        id: `fixture-type-${i}`,
        title: card.title,
        description: card.description,
        icon: 'layers',
        color: '#059669',
      })),
    },
  }

  const features: CardGridBlock = {
    id: 'fixture-cardgrid-features-fazla-mesai',
    type: 'card-grid',
    sortOrder: order++,
    title: 'Programın Özellikleri',
    description: '',
    visibility: { ...baseVisibility(), showDescription: false },
    style: baseStyle(),
    settings: {
      columns: 3,
      cards: L.programBenefits.map((b, i) => ({
        id: `fixture-feat-${i}`,
        title: b.title,
        description: b.text,
        icon: 'check-circle',
        color: '#059669',
      })),
    },
  }

  const howItWorks: CardGridBlock = {
    id: 'fixture-cardgrid-steps-fazla-mesai',
    type: 'card-grid',
    sortOrder: order++,
    title: 'Nasıl Çalışır',
    description: '',
    visibility: { ...baseVisibility(), showDescription: false },
    style: baseStyle(),
    settings: {
      columns: 3,
      variant: 'steps',
      cards: L.processSteps.map((s, i) => ({
        id: `fixture-step-${i}`,
        title: s.title,
        description: s.description,
        icon: 'circle',
        color: '#0d9488',
      })),
    },
  }

  const callout: CalloutBlock = {
    id: 'fixture-callout-fazla-mesai',
    type: 'callout',
    sortOrder: order++,
    title: 'Not',
    description: '',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      tone: 'info',
      body: '<p>Bu içerik <strong>yerel test/fixture</strong> verisidir; üretim CMS verisi taşınmamıştır.</p>',
    },
  }

  const video: VideoEmbedBlock = {
    id: 'fixture-video-fazla-mesai',
    type: 'video-embed',
    sortOrder: order++,
    title: 'Tanıtım videosu (opsiyonel)',
    description: 'YouTube URL eklendiğinde responsive embed render edilir.',
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      caption: 'Örnek embed — gerçek ürün videosuyla değiştirilebilir',
    },
  }

  const bottomCta: CtaBlock = {
    id: 'fixture-cta-fazla-mesai',
    type: 'cta',
    sortOrder: order++,
    title: 'Fazla mesai hesaplamalarına başlayın',
    description: 'Bilirkişi Hesap ile 12 farklı fazla mesai modelini tek yerden yönetin.',
    visibility: { ...baseVisibility(), showImage: false },
    style: baseStyle(),
    settings: {
      backgroundType: 'gradient',
      gradient: 'linear-gradient(135deg, #0f172a, #134e4a)',
      buttons: [
        {
          id: 'fixture-cta-btn',
          label: 'Bilirkişi Hesap sayfasına git',
          href: '/yazilimlar/bilirkisi-hesap',
          variant: 'primary',
          visible: true,
        },
      ],
    },
  }

  return [hero, article, typesGrid, features, howItWorks, callout, video, bottomCta]
}

export function buildFazlaMesaiModulePageContent(): BhModulePageContent {
  return {
    ...raw.catalog,
    showOnBhProductPage: true,
    seoTitle: raw.seoTitle,
    seoDescription: raw.seoDescription,
    blocks: buildFazlaMesaiBuilderBlocks(),
  }
}

export function buildFazlaMesaiFixtureDocument() {
  const page = buildFazlaMesaiModulePageContent()
  return {
    pages: {
      [page.slug]: page,
    },
  }
}

export const FAZLA_MESAI_FIXTURE_SLUG = raw.slug
export const FAZLA_MESAI_FIXTURE_SEO = {
  seoTitle: raw.seoTitle,
  seoDescription: raw.seoDescription,
}
export const FAZLA_MESAI_ACCEPTANCE = {
  articleHeadings: raw.landing.articleHeadings,
  moduleTypeCount: raw.landing.moduleTypes.length,
  listItemsSample: raw.landing.listItemsSample,
  programBenefitCount: raw.landing.programBenefits.length,
  processStepCount: raw.landing.processSteps.length,
}
