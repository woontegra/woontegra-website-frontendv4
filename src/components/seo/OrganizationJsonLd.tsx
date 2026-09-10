import { useMemo } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import { defaultLegalCompanyInfo } from '@/data/legalCompanyInfo'
import { useLegalCompanyInfo } from '@/hooks/useLegalCompanyInfo'
import { organizationSchema } from '@/lib/siteSeo'

/** Site genelinde tek Organization JSON-LD (duplicate üretmez). */
export function OrganizationJsonLd() {
  const company = useLegalCompanyInfo()
  const info = company ?? defaultLegalCompanyInfo

  const sameAs = [info.linkedin, info.instagram, info.facebook, info.youtube, info.twitter].filter(
    (url) => Boolean(url?.trim()),
  )

  const data = useMemo(
    () =>
      organizationSchema({
        email: info.email,
        telephone: info.phone,
        streetAddress: info.address,
        addressLocality: info.district || info.city,
        addressRegion: info.city,
        sameAs,
      }),
    [info.email, info.phone, info.address, info.district, info.city, sameAs.join('|')],
  )

  return <JsonLd id="organization" data={data} />
}
