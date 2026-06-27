import { mergeMarketingPageContent, type MarketingPageContent } from '@/types/marketingPageContent'

export const PAGE_CONTENT_KEYS = {
  about: 'about',
  contact: 'contact',
} as const

export type PageContentKey = (typeof PAGE_CONTENT_KEYS)[keyof typeof PAGE_CONTENT_KEYS]

export const HOME_PAGE_KEY = 'home' as const

export type HomePageContent = {
  heroTitle: string
  heroSubtitle: string
  heroImage: string
  seoTitle: string
  seoDescription: string
}

export const defaultHomePageContent: HomePageContent = {
  heroTitle: 'Woontegra',
  heroSubtitle: 'Dijital ürünler, yazılım ve teknoloji çözümleri.',
  heroImage: '',
  seoTitle: 'Woontegra',
  seoDescription: 'Kurumsal yazılım, e-ticaret ve dijital çözümler.',
}

export type AboutPageContent = {
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    image: string
  }
  metaDescription: string
  introTitle: string
  introText: string
}

export const defaultAboutPageContent: AboutPageContent = {
  hero: {
    eyebrow: 'Hakkımızda',
    title: 'Teknoloji ve Deneyimle Büyüyen Yapı',
    subtitle: 'Woontegra; yazılım, e-ticaret ve dijital operasyon alanlarında uçtan uca çözümler sunar.',
    image: '/images/about-hero.jpg',
  },
  metaDescription: 'Woontegra hakkında — dijital ürünler, yazılım geliştirme ve teknoloji danışmanlığı.',
  introTitle: 'Biz Kimiz?',
  introText:
    'Kendi markalarımızdan edindiğimiz operasyon deneyimini müşterilerimizin dijital dönüşüm süreçlerine taşıyoruz.',
}

export type ContactPageContent = {
  heroTitle?: string
  heroSubtitle?: string
  heroImage?: string
  email?: string
  phone?: string
  address?: string
  formTitle?: string
  mapEmbedUrl?: string
  whatsApp?: string
}

function toString(value: unknown): string {
  return value == null ? '' : String(value).trim()
}

export function normalizeHomePageContent(raw: unknown): HomePageContent {
  if (!raw || typeof raw !== 'object') return { ...defaultHomePageContent }
  const row = raw as Record<string, unknown>
  const hero = row.hero && typeof row.hero === 'object' ? (row.hero as Record<string, unknown>) : {}
  return {
    heroTitle: toString(row.heroTitle || hero.title) || defaultHomePageContent.heroTitle,
    heroSubtitle: toString(row.heroSubtitle || hero.subtitle) || defaultHomePageContent.heroSubtitle,
    heroImage: toString(row.heroImage || hero.image),
    seoTitle: toString(row.seoTitle) || defaultHomePageContent.seoTitle,
    seoDescription: toString(row.seoDescription) || defaultHomePageContent.seoDescription,
  }
}

export function normalizeAboutContent(raw: unknown): AboutPageContent {
  if (!raw || typeof raw !== 'object') return { ...defaultAboutPageContent }
  const row = raw as Record<string, unknown>
  const heroRaw = row.hero && typeof row.hero === 'object' ? (row.hero as Record<string, unknown>) : {}
  return {
    hero: {
      eyebrow: toString(heroRaw.eyebrow) || defaultAboutPageContent.hero.eyebrow,
      title: toString(heroRaw.title) || defaultAboutPageContent.hero.title,
      subtitle: toString(heroRaw.subtitle) || defaultAboutPageContent.hero.subtitle,
      image: toString(heroRaw.image) || defaultAboutPageContent.hero.image,
    },
    metaDescription: toString(row.metaDescription) || defaultAboutPageContent.metaDescription,
    introTitle: toString(row.introTitle) || defaultAboutPageContent.introTitle,
    introText: toString(row.introText) || defaultAboutPageContent.introText,
  }
}

export function normalizeContactContent(raw: unknown): ContactPageContent {
  if (!raw || typeof raw !== 'object') return {}
  const row = raw as Record<string, unknown>
  return {
    heroTitle: toString(row.heroTitle),
    heroSubtitle: toString(row.heroSubtitle),
    heroImage: toString(row.heroImage),
    email: toString(row.email),
    phone: toString(row.phone),
    address: toString(row.address),
    formTitle: toString(row.formTitle),
    mapEmbedUrl: toString(row.mapEmbedUrl),
    whatsApp: toString(row.whatsApp),
  }
}

export const defaultContactContent: ContactPageContent = {
  heroTitle: 'İletişim',
  heroSubtitle: 'Projeniz veya sorularınız için bize ulaşın.',
  formTitle: 'Mesaj gönderin',
}

export { mergeMarketingPageContent, type MarketingPageContent }
