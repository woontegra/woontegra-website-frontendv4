import { useMemo } from 'react'
import { JsonLd } from '@/components/seo/JsonLd'
import { defaultLegalCompanyInfo } from '@/data/legalCompanyInfo'
import { useLegalCompanyInfo } from '@/hooks/useLegalCompanyInfo'
import { organizationSchema, socialProfileUrls } from '@/lib/siteSeo'

/** Site genelinde tek Organization JSON-LD (duplicate üretmez). */
export function OrganizationJsonLd() {
  const company = useLegalCompanyInfo()
  const info = company ?? defaultLegalCompanyInfo

  const sameAs = socialProfileUrls({
    linkedin: info.linkedin,
    instagram: info.instagram,
    facebook: info.facebook,
    youtube: info.youtube,
  })

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
