import type { ComponentType, SVGProps } from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import { openCookiePreferences } from '@/lib/cookieConsent'
import { DEFAULT_PUBLIC_SITE_SETTINGS, usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { useFooterGroups } from '@/hooks/useFooterGroups'
import { resolvePublicHref } from '@/lib/publicNavUrl'
import { SOCIAL_PROFILES, type SocialProfileId } from '@/lib/siteSeo'

type SocialIcon = ComponentType<SVGProps<SVGSVGElement>>

function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12.017 1.5C6.84 1.5 2.75 5.55 2.75 10.68c0 3.95 2.46 7.33 5.93 8.68-.08-.74-.16-1.87.03-2.68.17-.73 1.1-4.64 1.1-4.64s-.28-.56-.28-1.39c0-1.3.75-2.27 1.69-2.27.8 0 1.18.6 1.18 1.31 0 .8-.51 2-.77 3.11-.22.93.47 1.69 1.38 1.69 1.66 0 2.94-1.75 2.94-4.27 0-2.23-1.61-3.79-3.9-3.79-2.66 0-4.21 2-4.21 4.05 0 .8.31 1.67.69 2.14a.28.28 0 0 1 .07.27c-.08.29-.23.93-.26 1.06-.04.18-.13.21-.31.13-1.17-.54-1.9-2.24-1.9-3.62 0-2.94 2.14-5.65 6.17-5.65 3.24 0 5.76 2.31 5.76 5.39 0 3.22-2.03 5.81-4.86 5.81-.95 0-1.83-.49-2.15-1.07l-.58 2.22c-.21.81-.78 1.83-1.17 2.45a8.2 8.2 0 0 0 2.76.42c5.15 0 9.33-4.18 9.33-9.33 0-5.13-4.17-9.18-9.27-9.18z" />
    </svg>
  )
}

const SOCIAL_ICONS: Record<SocialProfileId, SocialIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  x: XIcon,
  pinterest: PinterestIcon,
}

export function PublicFooter() {
  const { groups } = useFooterGroups()
  const { data: settings } = usePublicSiteSettings()

  const siteName = settings?.siteName?.trim() || DEFAULT_PUBLIC_SITE_SETTINGS.siteName
  const contactEmail = settings?.contactEmail?.trim()
  const contactPhone = settings?.contactPhone?.trim()
  const contactAddress = settings?.contactAddress?.trim()

  const linkGroups = groups.filter((g) => g.id !== 'iletisim')

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-semibold text-white">{siteName}</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Yazılım şirketi — özel yazılım, güvenli ödeme ve merkezi lisans yönetimi.
            </p>
            <ul className="mt-5 flex flex-wrap items-center gap-2">
              {SOCIAL_PROFILES.map((profile) => {
                const Icon = SOCIAL_ICONS[profile.id]
                return (
                  <li key={profile.id}>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Woontegra ${profile.label}`}
                      title={profile.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-white"
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      <span className="sr-only">{profile.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>

          {linkGroups.map((group) => (
            <div key={group.id}>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">{group.title}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.id}>
                    {link.action === 'cookie-preferences' ? (
                      <button
                        type="button"
                        className="text-left hover:text-white"
                        onClick={() => openCookiePreferences()}
                      >
                        {link.label}
                      </button>
                    ) : link.href?.startsWith('http') ||
                      link.href?.startsWith('mailto:') ||
                      link.href?.startsWith('tel:') ? (
                      <a
                        href={link.href}
                        className="hover:text-white"
                        target={link.openInNewTab || link.href.startsWith('http') ? '_blank' : undefined}
                        rel={
                          link.openInNewTab || link.href.startsWith('http') ? 'noopener noreferrer' : undefined
                        }
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link to={resolvePublicHref(link.href ?? '/')} className="hover:text-white">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">İletişim</p>
            <ul className="mt-4 space-y-2 text-sm">
              {contactPhone ? (
                <li>
                  <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="hover:text-white">
                    {contactPhone}
                  </a>
                </li>
              ) : null}
              {contactEmail ? (
                <li>
                  <a href={`mailto:${contactEmail}`} className="hover:text-white">
                    {contactEmail}
                  </a>
                </li>
              ) : null}
              {contactAddress ? <li className="text-slate-400">{contactAddress}</li> : null}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteName}. Tüm hakları saklıdır.
          </p>
          <p>Lisanslar merkezi Woontegra Lisans Server üzerinden yönetilir.</p>
        </div>
      </div>
    </footer>
  )
}
