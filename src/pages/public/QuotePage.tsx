import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { PageHero } from '@/components/public/PageHero'
import { Button } from '@/components/ui/Button'
import { usePageMeta } from '@/hooks/usePageMeta'
import { publicApi } from '@/api/client'
import { trackLead } from '@/integrations/trackingEvents'

const projectTypes = [
  { id: 'software', label: 'Yazılım Geliştirme', icon: '💻' },
  { id: 'web-design', label: 'Web Tasarım', icon: '🎨' },
  { id: 'ecommerce', label: 'E-Ticaret', icon: '🛒' },
  { id: 'saas', label: 'SaaS Ürün', icon: '☁️' },
  { id: 'trademark', label: 'Marka & Patent', icon: '📋' },
  { id: 'consulting', label: 'Danışmanlık', icon: '💡' },
]

const budgetOptions = [
  { value: '10-50K', label: '10–50 bin ₺' },
  { value: '50-100K', label: '50–100 bin ₺' },
  { value: '100K+', label: '100 bin ₺ ve üzeri' },
]

const timelineOptions = [
  { value: 'urgent', label: 'Acil' },
  { value: '1-3-months', label: '1-3 Ay' },
  { value: 'flexible', label: 'Esnek' },
]

const inputClass = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none'

export function QuotePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    budget: '',
    timeline: '',
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  usePageMeta({
    title: 'Teklif Al | Woontegra',
    description: 'Projeniz için birkaç adımda hızlıca teklif talebi oluşturun.',
  })

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    if (step === 1 && !formData.type) newErrors.type = 'Lütfen bir proje türü seçin'
    if (step === 2) {
      if (!formData.description.trim()) newErrors.description = 'Proje açıklaması gerekli'
      if (!formData.budget) newErrors.budget = 'Bütçe aralığı seçin'
      if (!formData.timeline) newErrors.timeline = 'Zaman planı seçin'
    }
    if (step === 3) {
      if (!formData.name.trim()) newErrors.name = 'Ad Soyad gerekli'
      if (!formData.email.trim()) newErrors.email = 'E-posta gerekli'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Geçerli bir e-posta adresi girin'
      if (!formData.phone.trim()) newErrors.phone = 'Telefon gerekli'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    setIsSubmitting(true)
    try {
      const serviceLabel = projectTypes.find((t) => t.id === formData.type)?.label ?? formData.type
      const budgetLabel = budgetOptions.find((o) => o.value === formData.budget)?.label ?? formData.budget
      const timelineLabel = timelineOptions.find((o) => o.value === formData.timeline)?.label ?? formData.timeline
      const note = [
        formData.description.trim() ? `Açıklama: ${formData.description.trim()}` : '',
        budgetLabel ? `Bütçe: ${budgetLabel}` : '',
        timelineLabel ? `Zaman planı: ${timelineLabel}` : '',
        formData.company.trim() ? `Şirket: ${formData.company.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n')
      await publicApi.post('/mail/offer', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: serviceLabel,
        note,
      })
      trackLead({ source: 'teklif-al', email: formData.email })
      setSubmitted(true)
    } catch {
      setErrors({ submit: 'Teklif gönderilemedi. Lütfen tekrar deneyin veya iletişime geçin.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="bg-white">
        <PageHero
          eyebrow="Teklif"
          title="Talebiniz alındı"
          description="Ekibimiz en kısa sürede sizinle iletişime geçecektir."
          breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Teklif Al' }]}
        />
      </div>
    )
  }

  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Teklif Al"
        title="Projeniz İçin Teklif Alın"
        description="Birkaç adımda ihtiyacınızı paylaşın, size özel bir teklifle dönelim."
        breadcrumbs={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Teklif Al' }]}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ${currentStep >= step ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
          ))}
        </div>

        {currentStep === 1 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {projectTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData((p) => ({ ...p, type: type.id }))}
                className={`rounded-xl border p-4 text-left transition-all ${formData.type === type.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-200'}`}
              >
                <span className="text-2xl">{type.icon}</span>
                <p className="mt-2 font-semibold text-slate-900">{type.label}</p>
              </button>
            ))}
            {errors.type ? <p className="text-sm text-red-600 sm:col-span-2">{errors.type}</p> : null}
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-4">
            <textarea
              className={inputClass}
              rows={5}
              placeholder="Projenizi kısaca anlatın"
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            />
            {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
            <select
              className={inputClass}
              value={formData.budget}
              onChange={(e) => setFormData((p) => ({ ...p, budget: e.target.value }))}
            >
              <option value="">Bütçe aralığı seçin</option>
              {budgetOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.budget ? <p className="text-sm text-red-600">{errors.budget}</p> : null}
            <select
              className={inputClass}
              value={formData.timeline}
              onChange={(e) => setFormData((p) => ({ ...p, timeline: e.target.value }))}
            >
              <option value="">Zaman planı seçin</option>
              {timelineOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {errors.timeline ? <p className="text-sm text-red-600">{errors.timeline}</p> : null}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-4">
            <input
              className={inputClass}
              placeholder="Ad Soyad"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            />
            {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
            <input
              className={inputClass}
              placeholder="E-posta"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            />
            {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
            <input
              className={inputClass}
              placeholder="Telefon"
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            />
            {errors.phone ? <p className="text-sm text-red-600">{errors.phone}</p> : null}
            <input
              className={inputClass}
              placeholder="Şirket (opsiyonel)"
              value={formData.company}
              onChange={(e) => setFormData((p) => ({ ...p, company: e.target.value }))}
            />
            {errors.submit ? <p className="text-sm text-red-600">{errors.submit}</p> : null}
          </div>
        ) : null}

        <div className="mt-8 flex justify-between">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCurrentStep(currentStep - 1)
                setErrors({})
              }}
            >
              <ArrowLeft className="h-4 w-4" /> Geri
            </Button>
          ) : (
            <span />
          )}
          {currentStep < 3 ? (
            <Button type="button" onClick={() => validateStep(currentStep) && setCurrentStep(currentStep + 1)}>
              İleri <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" disabled={isSubmitting} onClick={() => void handleSubmit()}>
              {isSubmitting ? 'Gönderiliyor…' : 'Teklif Gönder'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
