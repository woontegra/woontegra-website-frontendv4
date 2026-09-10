import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  DEFAULT_OG_IMAGE,
  isNoIndexPath,
  normalizePublicPath,
  siteUrl,
} from '@/lib/siteSeo'

type PageMetaOptions = {
  title?: string
  description?: string
  /** Varsayılan: mevcut pathname */
  canonicalPath?: string
  noindex?: boolean
  robots?: string
  /** og:type — public içerik için varsayılan website */
  ogType?: 'website' | 'article' | 'product'
  /** Gerçek OG görseli; yoksa varsayılan logo */
  ogImage?: string | null
  /** Sosyal meta üretme (private sayfalar) */
  social?: boolean
}

function upsertMetaByAttr(attr: 'name' | 'property', key: string, content: string) {
  let meta = document.querySelector(`meta[${attr}="${key}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute(attr, key)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function removeMetaByAttr(attr: 'name' | 'property', key: string) {
  document.querySelector(`meta[${attr}="${key}"]`)?.remove()
}

function upsertLink(rel: string, href: string) {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.rel = rel
    document.head.appendChild(link)
  }
  link.href = href
}

function removeLink(rel: string) {
  document.querySelector(`link[rel="${rel}"]`)?.remove()
}

function removeMeta(name: string) {
  document.querySelector(`meta[name="${name}"]`)?.remove()
}

export function usePageMeta(options: PageMetaOptions) {
  const location = useLocation()
  const path = normalizePublicPath(options.canonicalPath ?? location.pathname)
  const shouldNoIndex = options.noindex ?? isNoIndexPath(path)
  const enableSocial = options.social !== false && !shouldNoIndex
  const canonical = siteUrl(path)
  const ogImage = (options.ogImage?.trim() || DEFAULT_OG_IMAGE).trim()

  useLayoutEffect(() => {
    if (options.title) document.title = options.title

    if (options.description) {
      upsertMetaByAttr('name', 'description', options.description)
    }

    if (shouldNoIndex) {
      upsertMetaByAttr('name', 'robots', options.robots ?? 'noindex, nofollow')
      removeLink('canonical')
      removeMetaByAttr('property', 'og:title')
      removeMetaByAttr('property', 'og:description')
      removeMetaByAttr('property', 'og:url')
      removeMetaByAttr('property', 'og:type')
      removeMetaByAttr('property', 'og:site_name')
      removeMetaByAttr('property', 'og:image')
      removeMetaByAttr('property', 'og:locale')
      removeMeta('twitter:card')
      removeMeta('twitter:title')
      removeMeta('twitter:description')
      removeMeta('twitter:image')
    } else {
      removeMeta('robots')
      upsertLink('canonical', canonical)

      if (enableSocial && options.title && options.description) {
        upsertMetaByAttr('property', 'og:title', options.title)
        upsertMetaByAttr('property', 'og:description', options.description)
        upsertMetaByAttr('property', 'og:url', canonical)
        upsertMetaByAttr('property', 'og:type', options.ogType ?? 'website')
        upsertMetaByAttr('property', 'og:site_name', 'Woontegra')
        upsertMetaByAttr('property', 'og:locale', 'tr_TR')
        upsertMetaByAttr('property', 'og:image', ogImage)

        upsertMetaByAttr('name', 'twitter:card', 'summary_large_image')
        upsertMetaByAttr('name', 'twitter:title', options.title)
        upsertMetaByAttr('name', 'twitter:description', options.description)
        upsertMetaByAttr('name', 'twitter:image', ogImage)
      }
    }
  }, [
    options.title,
    options.description,
    options.robots,
    options.ogType,
    ogImage,
    path,
    shouldNoIndex,
    enableSocial,
    canonical,
  ])
}

export function usePrivatePageMeta(title?: string) {
  usePageMeta({ title, noindex: true, social: false })
}
