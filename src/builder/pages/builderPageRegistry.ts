import { MARKETING_PAGE_KEYS } from '@/types/marketingPageContent'

import { HOME_PAGE_KEY } from '@/types/homePageContent'

import { PAGE_CONTENT_KEYS } from '@/types/pageContent'

import {

  blogPostBuilderPageKey,

  BUILDER_MENU_BLOG_POSTS,

  BUILDER_MENU_LEGAL,

  BUILDER_MENU_PRODUCTS,

  BUILDER_MENU_SERVICES,

  BUILDER_MENU_SOLUTIONS,

  BUILDER_PAGE_GROUP_LABELS,

  productBuilderPageKey,

  serviceBuilderPageKey,

  solutionBuilderPageKey,

  type BuilderPageGroupId,

} from '@/builder/data/builderNavCatalog'

import { SERVICE_PAGE_CONTENT_KEY } from '@/data/serviceCatalog'

import { SOLUTION_PAGE_CONTENT_KEY } from '@/data/solutionCatalog'



export type BuilderPageKind =

  | 'landing'

  | 'service-detail'

  | 'solution-detail'

  | 'product-detail'

  | 'blog-detail'

  | 'legal'



export type BuilderPageDefinition = {

  key: string

  title: string

  contentKey: string

  previewPath: string

  group: BuilderPageGroupId

  kind: BuilderPageKind

  slug?: string

}



const LANDING_PAGES: BuilderPageDefinition[] = [

  { key: 'home', title: 'Ana Sayfa', contentKey: HOME_PAGE_KEY, previewPath: '/', group: 'main', kind: 'landing' },

  {

    key: 'about',

    title: 'Hakkımızda',

    contentKey: PAGE_CONTENT_KEYS.about,

    previewPath: '/hakkimizda',

    group: 'main',

    kind: 'landing',

  },

  {

    key: 'services',

    title: 'Hizmetler (Landing)',

    contentKey: MARKETING_PAGE_KEYS.services,

    previewPath: '/hizmetler',

    group: 'main',

    kind: 'landing',

  },

  {

    key: 'solutions',

    title: 'Çözümler (Landing)',

    contentKey: MARKETING_PAGE_KEYS.solutions,

    previewPath: '/cozumler',

    group: 'main',

    kind: 'landing',

  },

  {

    key: 'software',

    title: 'Yazılımlar (Landing)',

    contentKey: 'softwarePage',

    previewPath: '/yazilimlar',

    group: 'main',

    kind: 'landing',

  },

  {

    key: 'blog',

    title: 'Blog (Landing)',

    contentKey: 'blogPage',

    previewPath: '/blog',

    group: 'main',

    kind: 'landing',

  },

  {

    key: 'contact',

    title: 'İletişim',

    contentKey: PAGE_CONTENT_KEYS.contact,

    previewPath: '/iletisim',

    group: 'main',

    kind: 'landing',

  },

]



const SERVICE_DETAIL_PAGES: BuilderPageDefinition[] = BUILDER_MENU_SERVICES.map((s) => ({

  key: serviceBuilderPageKey(s.slug),

  title: s.title,

  contentKey: SERVICE_PAGE_CONTENT_KEY,

  previewPath: s.path,

  group: 'services' as const,

  kind: 'service-detail' as const,

  slug: s.slug,

}))



const SOLUTION_DETAIL_PAGES: BuilderPageDefinition[] = BUILDER_MENU_SOLUTIONS.map((s) => ({

  key: solutionBuilderPageKey(s.slug),

  title: s.title,

  contentKey: SOLUTION_PAGE_CONTENT_KEY,

  previewPath: s.path,

  group: 'solutions' as const,

  kind: 'solution-detail' as const,

  slug: s.slug,

}))



const PRODUCT_DETAIL_PAGES: BuilderPageDefinition[] = BUILDER_MENU_PRODUCTS.map((p) => ({

  key: productBuilderPageKey(p.slug),

  title: p.title,

  contentKey: 'productPages',

  previewPath: p.path,

  group: 'products' as const,

  kind: 'product-detail' as const,

  slug: p.slug,

}))



const BLOG_DETAIL_PAGES: BuilderPageDefinition[] = BUILDER_MENU_BLOG_POSTS.map((b) => ({

  key: blogPostBuilderPageKey(b.slug),

  title: b.title,

  contentKey: 'blogPages',

  previewPath: b.path,

  group: 'blog' as const,

  kind: 'blog-detail' as const,

  slug: b.slug,

}))



const LEGAL_PAGES: BuilderPageDefinition[] = BUILDER_MENU_LEGAL.map((l) => ({

  key: l.key,

  title: l.title,

  contentKey: l.contentKey,

  previewPath: l.path,

  group: 'legal' as const,

  kind: 'legal' as const,

}))



export const BUILDER_PAGE_REGISTRY: BuilderPageDefinition[] = [

  ...LANDING_PAGES,

  ...SERVICE_DETAIL_PAGES,

  ...SOLUTION_DETAIL_PAGES,

  ...PRODUCT_DETAIL_PAGES,

  ...BLOG_DETAIL_PAGES,

  ...LEGAL_PAGES,

]



export function getBuilderPageDefinition(pageKey: string): BuilderPageDefinition | undefined {

  return BUILDER_PAGE_REGISTRY.find((p) => p.key === pageKey)

}



export function resolveBuilderPageKey(input?: string | null): string {

  const key = (input ?? 'home').trim()

  return getBuilderPageDefinition(key) ? key : 'home'

}



export function builderEditUrl(pageKey: string): string {

  return `/admin/builder?page=${encodeURIComponent(pageKey)}`

}



export type BuilderPageOption = {

  key: string

  title: string

  group: BuilderPageGroupId

  groupLabel: string

}



export const BUILDER_PAGE_OPTIONS: BuilderPageOption[] = BUILDER_PAGE_REGISTRY.map((p) => ({

  key: p.key,

  title: p.title,

  group: p.group,

  groupLabel: BUILDER_PAGE_GROUP_LABELS[p.group],

}))



export const BUILDER_PAGE_GROUPS = (

  Object.keys(BUILDER_PAGE_GROUP_LABELS) as BuilderPageGroupId[]

).map((id) => ({

  id,

  label: BUILDER_PAGE_GROUP_LABELS[id],

  pages: BUILDER_PAGE_OPTIONS.filter((p) => p.group === id),

}))


