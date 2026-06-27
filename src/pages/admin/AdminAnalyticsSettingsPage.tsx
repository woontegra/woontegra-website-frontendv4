import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, FlaskConical, Save } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { getErrorMessage } from '@/api/client'
import { trackingSettingsService } from '@/services/trackingSettingsService'
import {
  ANALYTICS_SECRET_MASK,
  DEFAULT_ANALYTICS_SETTINGS,
  DEFAULT_TRACKING_EVENTS,
  parseGoogleSiteVerificationInput,
  toPublicAnalyticsConfig,
  validateGa4MeasurementId,
  validateGtmContainerId,
  validateMetaPixelId,
  type AnalyticsSettings,
  type TrackingEventName,
} from '@/types/analyticsSettings'
import { setTrackingConfig, trackAddToCart, trackLead, trackPageView } from '@/integrations/trackingEvents'
import { cn } from '@/lib/cn'

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 px-4 py-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 rounded border-slate-300" />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  )
}

const EVENT_LABELS: Record<TrackingEventName, string> = {
  pageView: 'PageView',
  viewContent: 'ViewContent',
  addToCart: 'AddToCart',
  initiateCheckout: 'InitiateCheckout',
  purchase: 'Purchase',
  lead: 'Lead',
  contact: 'Contact',
  signUp: 'SignUp',
  login: 'Login',
  search: 'Search',
}

export function AdminAnalyticsSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<AnalyticsSettings>(DEFAULT_ANALYTICS_SETTINGS)
  const [gaSecretInput, setGaSecretInput] = useState('')
  const [metaTokenInput, setMetaTokenInput] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'analyticsSettings'],
    queryFn: () => trackingSettingsService.getAdmin(),
  })

  useEffect(() => {
    if (data) {
      setForm(data)
      setGaSecretInput('')
      setMetaTokenInput('')
    }
  }, [data])

  const validation = useMemo(
    () => ({
      ga: form.googleAnalytics.enabled ? validateGa4MeasurementId(form.googleAnalytics.measurementId) : null,
      gtm: form.googleTagManager.enabled ? validateGtmContainerId(form.googleTagManager.containerId) : null,
      meta: form.metaPixel.enabled ? validateMetaPixelId(form.metaPixel.pixelId) : null,
    }),
    [form],
  )

  const hasValidationError = Boolean(validation.ga || validation.gtm || validation.meta)

  const saveMutation = useMutation({
    mutationFn: () =>
      trackingSettingsService.update({
        ...form,
        gaApiSecretInput: gaSecretInput,
        metaAccessTokenInput: metaTokenInput,
      }),
    onSuccess: (next) => {
      setForm(next)
      setGaSecretInput('')
      setMetaTokenInput('')
      void queryClient.invalidateQueries({ queryKey: ['public', 'trackingSettings'] })
      setMessage({ type: 'success', text: 'Analytics ayarları kaydedildi.' })
    },
    onError: (err) => setMessage({ type: 'error', text: getErrorMessage(err, 'Kayıt başarısız') }),
  })

  const patchGa = (patch: Partial<AnalyticsSettings['googleAnalytics']>) =>
    setForm((p) => ({ ...p, googleAnalytics: { ...p.googleAnalytics, ...patch } }))
  const patchGtm = (patch: Partial<AnalyticsSettings['googleTagManager']>) =>
    setForm((p) => ({ ...p, googleTagManager: { ...p.googleTagManager, ...patch } }))
  const patchSc = (patch: Partial<AnalyticsSettings['searchConsole']>) =>
    setForm((p) => ({ ...p, searchConsole: { ...p.searchConsole, ...patch } }))
  const patchMeta = (patch: Partial<AnalyticsSettings['metaPixel']>) =>
    setForm((p) => ({ ...p, metaPixel: { ...p.metaPixel, ...patch } }))
  const patchEvent = (key: TrackingEventName, value: boolean) =>
    setForm((p) => ({ ...p, events: { ...p.events, [key]: value } }))

  const runTest = (kind: 'pageView' | 'addToCart' | 'lead') => {
    setTrackingConfig(toPublicAnalyticsConfig(form))
    if (kind === 'pageView') trackPageView('/admin/settings/analytics?test=1')
    if (kind === 'addToCart') trackAddToCart({ id: 'test-product', name: 'Test Ürün', price: 1, currency: 'TRY' })
    if (kind === 'lead') trackLead({ source: 'admin_test' })
    setMessage({ type: 'success', text: `${kind} test eventi gönderildi (debug modunda console).` })
  }

  if (isLoading) return <LoadingState label="Analytics ayarları yükleniyor…" />

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Analytics & Pixel"
        description="Google Analytics 4, GTM, Search Console ve Meta Pixel — PATCH /api/settings + GET /api/settings/tracking"
        actions={
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || hasValidationError}>
            <Save className="h-4 w-4" />
            {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        }
      />

      {isError ? (
        <Card className="border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-700">{getErrorMessage(error, 'Ayarlar yüklenemedi')}</p>
          </CardBody>
        </Card>
      ) : null}

      {message ? (
        <div
          className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800',
          )}
        >
          {message.text}
        </div>
      ) : null}

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-semibold text-slate-900">Google Analytics 4</h2>
          </div>
          <p className="text-xs text-slate-500">Admin → GA4 Property → Data Streams → Measurement ID (G-…)</p>
          <ToggleRow label="Google Analytics aktif" checked={form.googleAnalytics.enabled} onChange={(enabled) => patchGa({ enabled })} />
          <Input
            label="Measurement ID"
            value={form.googleAnalytics.measurementId}
            onChange={(e) => patchGa({ measurementId: e.target.value.toUpperCase() })}
            placeholder="G-XXXXXXXXXX"
          />
          {validation.ga ? <p className="text-sm text-red-600">{validation.ga}</p> : null}
          <ToggleRow label="Measurement Protocol" checked={form.googleAnalytics.measurementProtocolEnabled} onChange={(v) => patchGa({ measurementProtocolEnabled: v })} description="Sunucu tarafı ölçüm (API secret gerekir)." />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Measurement Protocol API Secret</label>
            <input
              type="password"
              autoComplete="new-password"
              value={gaSecretInput}
              onChange={(e) => setGaSecretInput(e.target.value)}
              placeholder={
                form.googleAnalytics.apiSecretConfigured
                  ? `Kayıtlı (${form.googleAnalytics.apiSecretPreview || ANALYTICS_SECRET_MASK}) — değiştirmek için yazın`
                  : 'API secret'
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="text-xs text-slate-500">Boş bırakırsanız mevcut secret korunur.</p>
          </div>
          <ToggleRow label="Debug mode" checked={form.googleAnalytics.debugMode} onChange={(v) => patchGa({ debugMode: v })} />
          <Input label="Server container URL (opsiyonel)" value={form.googleAnalytics.serverContainerUrl} onChange={(e) => patchGa({ serverContainerUrl: e.target.value })} />
          <Input label="Transport URL (opsiyonel)" value={form.googleAnalytics.transportUrl} onChange={(e) => patchGa({ transportUrl: e.target.value })} />
          <ToggleRow label="Consent Mode" checked={form.googleAnalytics.consentModeEnabled} onChange={(v) => patchGa({ consentModeEnabled: v })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Consent default</label>
            <select
              value={form.googleAnalytics.defaultConsent}
              onChange={(e) => patchGa({ defaultConsent: e.target.value as 'granted' | 'denied' })}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="denied">denied</option>
              <option value="granted">granted</option>
            </select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Google Tag Manager</h2>
          <p className="text-xs text-slate-500">tagmanager.google.com → Container ID (GTM-…)</p>
          <ToggleRow label="GTM aktif" checked={form.googleTagManager.enabled} onChange={(enabled) => patchGtm({ enabled })} />
          <Input label="Container ID" value={form.googleTagManager.containerId} onChange={(e) => patchGtm({ containerId: e.target.value.toUpperCase() })} placeholder="GTM-XXXXXXX" />
          {validation.gtm ? <p className="text-sm text-red-600">{validation.gtm}</p> : null}
          <Input label="DataLayer adı" value={form.googleTagManager.dataLayerName} onChange={(e) => patchGtm({ dataLayerName: e.target.value })} placeholder="dataLayer" />
          <ToggleRow label="Head script" checked={form.googleTagManager.headScriptEnabled} onChange={(v) => patchGtm({ headScriptEnabled: v })} />
          <ToggleRow label="Body noscript" checked={form.googleTagManager.bodyNoscriptEnabled} onChange={(v) => patchGtm({ bodyNoscriptEnabled: v })} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Google Search Console</h2>
          <ToggleRow label="Search Console doğrulama aktif" checked={form.searchConsole.enabled} onChange={(enabled) => patchSc({ enabled })} />
          <Input
            label="HTML meta verification"
            value={form.searchConsole.verificationCode}
            onChange={(e) => patchSc({ verificationCode: parseGoogleSiteVerificationInput(e.target.value) })}
            placeholder='content değeri veya tam <meta name="google-site-verification" … />'
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="font-medium">Yardımcı linkler</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              <li>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                  /robots.txt
                </a>
              </li>
              <li>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                  /sitemap.xml
                </a>
              </li>
            </ul>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Meta / Facebook Pixel</h2>
          <p className="text-xs text-slate-500">Events Manager → Pixel ID. Conversion API backend&apos;de metaConversions.service ile sınırlı event seti destekler.</p>
          <ToggleRow label="Meta Pixel aktif" checked={form.metaPixel.enabled} onChange={(enabled) => patchMeta({ enabled })} />
          <Input label="Pixel ID" value={form.metaPixel.pixelId} onChange={(e) => patchMeta({ pixelId: e.target.value.replace(/\D/g, '') })} placeholder="1234567890" />
          {validation.meta ? <p className="text-sm text-red-600">{validation.meta}</p> : null}
          <ToggleRow label="Advanced Matching" checked={form.metaPixel.advancedMatchingEnabled} onChange={(v) => patchMeta({ advancedMatchingEnabled: v })} />
          <ToggleRow label="Conversion API (server-side)" checked={form.metaPixel.conversionApiEnabled} onChange={(v) => patchMeta({ conversionApiEnabled: v })} description="Backend metaConversions.service — tarayıcı eventleri ayrı çalışır." />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Conversion API Access Token</label>
            <input
              type="password"
              autoComplete="new-password"
              value={metaTokenInput}
              onChange={(e) => setMetaTokenInput(e.target.value)}
              placeholder={
                form.metaPixel.accessTokenConfigured
                  ? `Kayıtlı (${form.metaPixel.accessTokenPreview || ANALYTICS_SECRET_MASK}) — değiştirmek için yazın`
                  : 'Access token'
              }
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
            <p className="text-xs text-slate-500">Boş bırakırsanız mevcut token korunur. Server-side Purchase/Lead backend tetikleyicileri sınırlıdır.</p>
          </div>
          <Input label="Test Event Code (opsiyonel)" value={form.metaPixel.testEventCode} onChange={(e) => patchMeta({ testEventCode: e.target.value })} />
          <ToggleRow label="Event deduplication" checked={form.metaPixel.deduplicationEnabled} onChange={(v) => patchMeta({ deduplicationEnabled: v })} />
          <ToggleRow label="Debug / log mode" checked={form.metaPixel.debugMode} onChange={(v) => patchMeta({ debugMode: v })} />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Event ayarları</h2>
          <p className="text-sm text-slate-600">Client-side event helper üzerinden GA4 + Meta Pixel birlikte yönetilir.</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(DEFAULT_TRACKING_EVENTS) as TrackingEventName[]).map((key) => (
              <ToggleRow key={key} label={EVENT_LABELS[key]} checked={form.events[key]} onChange={(v) => patchEvent(key, v)} />
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="border-violet-200 bg-violet-50/40">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-violet-700" />
            <h2 className="text-base font-semibold text-slate-900">Test / Debug</h2>
          </div>
          <p className="text-sm text-slate-600">Kaydetmeden önce formdaki ayarlarla client-side test eventleri gönderir. GA/Meta debug modunda console çıktısı görünür.</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => runTest('pageView')}>
              PageView test
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => runTest('addToCart')}>
              AddToCart test
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => runTest('lead')}>
              Lead test
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="sticky bottom-0 flex justify-end border-t border-slate-100 bg-slate-50/90 py-3 backdrop-blur-sm">
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || hasValidationError}>
          {saveMutation.isPending ? 'Kaydediliyor…' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}
