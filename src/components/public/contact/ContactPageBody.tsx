import { useMemo, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QUICK_CONTACT_WHATSAPP_DISPLAY, buildQuickContactWhatsAppHref } from '@/lib/quickContact'
import { ErrorState } from '@/components/public/ErrorState'
import { usePublicSiteSettings } from '@/hooks/usePublicSiteSettings'
import { contactMessagesService } from '@/services/contactMessagesService'
import { trackContact, trackLead } from '@/integrations/trackingEvents'
import { defaultContactContent, type ContactPageContent } from '@/types/pageContent'
import { getErrorMessage } from '@/api/client'

type Props = {
  content?: ContactPageContent
  contentError?: unknown
}

export function ContactPageBody({ content: data, contentError }: Props) {
  const [params] = useSearchParams()
  const subject = params.get('konu')?.trim() ?? ''
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState(subject ? `Konu: ${subject}\n\n` : '')
  const [sent, setSent] = useState(false)

  const { data: settings } = usePublicSiteSettings()
  const content = { ...defaultContactContent, ...data }
  const contactEmail = settings?.contactEmail?.trim() || content.email?.trim()
  const contactPhone = settings?.contactPhone?.trim() || content.phone?.trim()
  const contactAddress = settings?.contactAddress?.trim() || content.address?.trim()

  const contactCards = useMemo(
    () =>
      [
        contactEmail ? { icon: Mail, label: 'E-posta', value: contactEmail, href: `mailto:${contactEmail}` } : null,
        contactPhone
          ? { icon: Phone, label: 'Telefon', value: contactPhone, href: `tel:${contactPhone.replace(/\s/g, '')}` }
          : null,
        {
          icon: MessageCircle,
          label: 'WhatsApp',
          value: QUICK_CONTACT_WHATSAPP_DISPLAY,
          href: buildQuickContactWhatsAppHref(),
        },
        contactAddress ? { icon: MapPin, label: 'Adres', value: contactAddress, href: null as string | null } : null,
      ].filter(Boolean),
    [contactEmail, contactPhone, contactAddress],
  )

  const mutation = useMutation({
    mutationFn: () =>
      contactMessagesService.create({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        phone: phone.trim() || undefined,
      }),
    onSuccess: () => {
      setSent(true)
      trackLead({ source: 'contact_form', email: email.trim() })
      trackContact({ source: 'contact_form' })
      setName('')
      setEmail('')
      setPhone('')
      setMessage('')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return
    mutation.mutate()
  }

  return (
    <section className="py-16">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="space-y-4">
          {contactCards.map((card) =>
            card ? (
              <div key={card.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <card.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{card.label}</p>
                  {card.href ? (
                    <a
                      href={card.href}
                      {...(card.href.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="text-[17px] font-bold text-slate-950 hover:text-emerald-700"
                    >
                      {card.value}
                    </a>
                  ) : (
                    <p className="text-[15px] font-semibold text-slate-900">{card.value}</p>
                  )}
                </div>
              </div>
            ) : null,
          )}
          {contentError ? (
            <ErrorState message={getErrorMessage(contentError, 'İletişim bilgileri yüklenemedi')} />
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-extrabold text-slate-950">{content.formTitle || 'Mesaj gönderin'}</h2>
          {sent ? (
            <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              Mesajınız alındı. En kısa sürede dönüş yapacağız.
            </p>
          ) : null}
          <div className="mt-4 space-y-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefon (isteğe bağlı)"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
            />
            <textarea
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesajınız"
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
            />
            {mutation.isError ? (
              <p className="text-sm text-red-600">{getErrorMessage(mutation.error)}</p>
            ) : null}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="min-h-12 w-full rounded-lg bg-[#16A34A] px-4 text-[15px] font-bold text-white hover:bg-[#15803D] disabled:opacity-60"
            >
              {mutation.isPending ? 'Gönderiliyor…' : 'Gönder'}
            </button>
            <p className="text-xs leading-relaxed text-slate-500">
              Bilgileriniz yalnızca mesajınıza dönüş yapmak için kullanılır. Ayrıntılar için{' '}
              <Link to="/kvkk-aydinlatma-metni" className="font-semibold text-emerald-700 underline-offset-2 hover:underline">
                KVKK Aydınlatma Metni
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
