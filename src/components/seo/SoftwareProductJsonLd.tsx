import { useMemo } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  breadcrumbListSchema,
  siteUrl,
  softwareApplicationSchema,
  type BreadcrumbItemInput,
} from '@/lib/siteSeo'

type SoftwareSeoProps = {
  name: string
  description: string
  path: string
  applicationCategory?: string
  operatingSystem?: string | null
  price?: number | null
  priceCurrency?: string | null
  /** Yalnızca güvenilir fiyat bilindiğinde true */
  includeOffer?: boolean
  breadcrumbs?: BreadcrumbItemInput[]
}

export function SoftwareProductJsonLd({
  name,
  description,
  path,
  applicationCategory,
  operatingSystem,
  price,
  priceCurrency,
  includeOffer = false,
  breadcrumbs,
}: SoftwareSeoProps) {
  const appSchema = useMemo(
    () =>
      softwareApplicationSchema({
        name,
        description,
        url: siteUrl(path),
        applicationCategory,
        operatingSystem,
        price,
        priceCurrency,
        offerAvailable: includeOffer,
      }),
    [name, description, path, applicationCategory, operatingSystem, price, priceCurrency, includeOffer],
  )

  const crumbSchema = useMemo(
    () => (breadcrumbs && breadcrumbs.length > 0 ? breadcrumbListSchema(breadcrumbs) : null),
    [breadcrumbs],
  )

  return (
    <>
      <JsonLd id="software-application" data={appSchema} />
      {crumbSchema ? <JsonLd id="breadcrumb" data={crumbSchema} /> : null}
    </>
  )
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItemInput[] }) {
  const data = useMemo(() => breadcrumbListSchema(items), [items])
  if (!items.length) return null
  return <JsonLd id="breadcrumb" data={data} />
}
