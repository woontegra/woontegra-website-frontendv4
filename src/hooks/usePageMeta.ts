import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { isNoIndexPath, normalizePublicPath, siteUrl } from '@/lib/siteSeo'

type PageMetaOptions = {
  title?: string
  description?: string
  /** Varsayılan: mevcut pathname */
  canonicalPath?: string
  noindex?: boolean
  robots?: string
}

function upsertMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
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

  useEffect(() => {
    if (options.title) document.title = options.title

    if (options.description) {
      upsertMeta('description', options.description)
    }

    if (shouldNoIndex) {
      upsertMeta('robots', options.robots ?? 'noindex, nofollow')
      removeLink('canonical')
    } else {
      removeMeta('robots')
      upsertLink('canonical', siteUrl(path))
    }
  }, [options.title, options.description, options.robots, path, shouldNoIndex])
}

export function usePrivatePageMeta(title?: string) {
  usePageMeta({ title, noindex: true })
}
