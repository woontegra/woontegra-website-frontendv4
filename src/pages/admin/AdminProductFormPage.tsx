import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowDown, ArrowLeft, ArrowUp, ImageIcon, Images, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { CentralLicenseInfoBanner } from '@/components/admin/CentralLicenseInfoBanner'
import { ProductFormSummary } from '@/components/admin/product-form/ProductFormSummary'
import { ProductR2DownloadFilesSection } from '@/components/admin/product-form/ProductR2DownloadFilesSection'
import {
  ADMIN_PRODUCT_PRESETS,
  applyProductPreset,
  inferPresetFromForm,
  presetShowsDownloadFields,
  presetShowsLicenseFields,
  presetShowsR2DownloadFields,
  presetShowsSaasFields,
  type AdminProductPresetId,
} from '@/constants/adminProductPresets'
import { LicenseProgramPicker } from '@/components/admin/LicenseProgramPicker'
import { adminProductsService, getErrorMessage } from '@/services/adminProductsService'
import { adminBhService, formatTlInput, type BhProduct } from '@/services/adminBhService'
import { bhDesktopInstallerFieldError } from '@/lib/bhDesktopInstaller'
import { publicApi } from '@/api/client'
import { publishedProductGalleryUrls } from '@/lib/publishedProductGallery'
import { BILIRKISI_HESAP_SLUG } from '@/data/canonicalSoftwareProducts'
import {
  AKTUERYA_DEFAULT_OFFERS,
  AKTUERYA_DESKTOP_APP_CODE,
  AKTUERYA_PRODUCT_SLUG,
  AKTUERYA_SAAS_APP_CODE,
  type AktueryaChannelPrices,
  type AktueryaProductOffers,
} from '@/data/aktueryaCatalog'
import { productCategoriesService } from '@/services/productCategoriesService'
import type { AdminProductInput } from '@/types/product'
import { collectGalleryMediaIdsForSave, moveGalleryRow, PRODUCT_GALLERY_MAX_IMAGES } from '@/types/product'
import type { CatalogMedia } from '@/types/catalogMedia'
import { ImageUploadSizeNote } from '@/components/admin/ImageUploadSizeNote'
import { MediaPickerModal } from '@/media/components/MediaPickerModal'
import { imageUploadSizeHint } from '@/constants/imageUploadSpecs'
import { slugifySoftwareName } from '@/types/product'
import {
  PRODUCT_FORM_TABS,
  PUBLISH_IMAGE_REQUIRED_MESSAGE,
  hasAdminCoverImage,
  tabForValidationError,
  validateAdminProductForm,
  type ProductFormTabId,
} from '@/lib/adminProductForm'
import { buildAdminProductSavePayload } from '@/lib/buildAdminProductSavePayload'
import { resolveMediaUrl } from '@/media/resolveMediaUrl'
import { cn } from '@/lib/cn'
import { SafeImage } from '@/components/ui/SafeImage'
import { buildAdminDownloadFilesFormState, emptyDownloadFilesConfig } from '@/lib/productDownloadFiles'
import { useToastStore } from '@/store/toastStore'

const emptyForm: AdminProductInput = {
  name: '',
  slug: '',
  productType: 'DOWNLOAD',
  shortDescription: '',
  description: '',
  price: 0,
  compareAtPrice: null,
  currency: 'TRY',
  isActive: true,
  purchaseEnabled: true,
  licenseMonths: 12,
  licenseRequired: false,
  licenseAppCode: null,
  licenseDays: 365,
  licenseMaxDevices: 1,
  featureBullets: '',
  isFeatured: false,
  sortOrder: 0,
  version: '',
  categoryId: null,
  seoTitle: '',
  seoDescription: '',
  coverImageMediaId: null,
  downloadMediaId: null,
  coverImage: '',
  downloadUrl: '',
  downloadFiles: emptyDownloadFilesConfig(),
}

type GalleryRow = { key: string; mediaId: string; preview: string }

type BhDesktopDraft = {
  windowsYearlyTl: string
  windowsSalesEnabled: boolean
  windowsDeviceLimit: string
  windowsTrialDays: string
  windowsDownloadUrl: string
  windowsVersion: string
  windowsFileSize: string
  windowsDownloadButtonLabel: string
  macosYearlyTl: string
  macosSalesEnabled: boolean
  macosDeviceLimit: string
  macosTrialDays: string
  macosDownloadUrl: string
  macosVersion: string
  macosFileSize: string
  macosDownloadButtonLabel: string
}

const emptyBhDesktop: BhDesktopDraft = {
  windowsYearlyTl: '',
  windowsSalesEnabled: false,
  windowsDeviceLimit: '1',
  windowsTrialDays: '7',
  windowsDownloadUrl: '',
  windowsVersion: '',
  windowsFileSize: '',
  windowsDownloadButtonLabel: '',
  macosYearlyTl: '',
  macosSalesEnabled: false,
  macosDeviceLimit: '1',
  macosTrialDays: '7',
  macosDownloadUrl: '',
  macosVersion: '',
  macosFileSize: '',
  macosDownloadButtonLabel: '',
}

function bhDesktopFromProduct(product: BhProduct): BhDesktopDraft {
  return {
    windowsYearlyTl: formatTlInput(product.windowsPriceYearly),
    windowsSalesEnabled: product.windowsSalesEnabled === true,
    windowsDeviceLimit: String(product.windowsDeviceLimit ?? 1),
    windowsTrialDays: String(product.windowsTrialDays ?? 7),
    windowsDownloadUrl: product.windowsDownloadUrl ?? '',
    windowsVersion: product.windowsVersion ?? '',
    windowsFileSize: product.windowsFileSize ?? '',
    windowsDownloadButtonLabel: product.windowsDownloadButtonLabel ?? '',
    macosYearlyTl: formatTlInput(product.macosPriceYearly),
    macosSalesEnabled: product.macosSalesEnabled === true,
    macosDeviceLimit: String(product.macosDeviceLimit ?? 1),
    macosTrialDays: String(product.macosTrialDays ?? 7),
    macosDownloadUrl: product.macosDownloadUrl ?? '',
    macosVersion: product.macosVersion ?? '',
    macosFileSize: product.macosFileSize ?? '',
    macosDownloadButtonLabel: product.macosDownloadButtonLabel ?? '',
  }
}

function isPositiveIntText(value: string): boolean {
  return /^[1-9]\d*$/.test(value.trim())
}

function aktueryaOffersError(offers: AktueryaProductOffers): string | null {
  for (const row of [offers.web, offers.windows, offers.macos]) {
    if (!Number.isFinite(row.monthlyTl) || row.monthlyTl < 0 || !Number.isFinite(row.yearlyTl) || row.yearlyTl < 0) {
      return 'Aktüerya aylık ve yıllık fiyatları 0 veya daha büyük olmalıdır.'
    }
    if (!Number.isInteger(row.deviceLimit) || row.deviceLimit < 1) {
      return 'Cihaz limiti 1 veya daha büyük bir tam sayı olmalıdır.'
    }
    if (!isOptionalHttpsUrl(row.downloadUrl)) {
      return 'Kurulum bağlantısı boş bırakılabilir veya https:// ile başlamalıdır.'
    }
  }
  return null
}

function AktueryaPriceFields({
  title,
  hint,
  licenseLabel,
  prices,
  showDeviceLimit,
  onChange,
}: {
  title: string
  hint: string
  licenseLabel: string
  prices: AktueryaChannelPrices
  showDeviceLimit?: boolean
  onChange: (next: AktueryaChannelPrices) => void
}) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{hint}</p>
        <p className="mt-1 text-xs font-medium text-slate-700">{licenseLabel}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Aylık fiyat (TL)"
          type="number"
          min={0}
          step="0.01"
          value={prices.monthlyTl}
          onChange={(e) => onChange({ ...prices, monthlyTl: Number.parseFloat(e.target.value) || 0 })}
        />
        <Input
          label="Yıllık fiyat (TL)"
          type="number"
          min={0}
          step="0.01"
          value={prices.yearlyTl}
          onChange={(e) => onChange({ ...prices, yearlyTl: Number.parseFloat(e.target.value) || 0 })}
        />
        {showDeviceLimit ? (
          <Input
            label="Cihaz limiti"
            type="number"
            min={1}
            step={1}
            value={prices.deviceLimit}
            onChange={(e) => onChange({ ...prices, deviceLimit: Number.parseInt(e.target.value, 10) || 1 })}
          />
        ) : null}
      </div>
    </section>
  )
}

function isOptionalHttpsUrl(value: string): boolean {
  const text = value.trim()
  if (!text) return true
  try {
    return new URL(text).protocol === 'https:' && text.length <= 2000
  } catch {
    return false
  }
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  hint?: string
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
  description,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </label>
  )
}

function HelpBox({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-sky-100 bg-sky-50/80 px-3 py-2.5 text-sm text-sky-950">{children}</p>
  )
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.show)
  const isNew = !id
  const [form, setForm] = useState<AdminProductInput>(emptyForm)
  const [presetId, setPresetId] = useState<AdminProductPresetId>('DOWNLOADABLE')
  const [tab, setTab] = useState<ProductFormTabId>('basic')
  const [slugManual, setSlugManual] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [useCoverUrl, setUseCoverUrl] = useState(false)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [galleryRows, setGalleryRows] = useState<GalleryRow[]>([])
  const [downloadInfo, setDownloadInfo] = useState<{ name: string; size: number } | null>(null)
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false)
  const [downloadPickerOpen, setDownloadPickerOpen] = useState(false)
  const [bhProduct, setBhProduct] = useState<BhProduct | null>(null)
  const [monthlyPriceTl, setMonthlyPriceTl] = useState<number | null>(null)
  const [bhPriceReady, setBhPriceReady] = useState(false)
  const [bhPriceError, setBhPriceError] = useState<string | null>(null)
  const [bhDesktop, setBhDesktop] = useState<BhDesktopDraft>(emptyBhDesktop)
  const [aktueryaOffers, setAktueryaOffers] = useState<AktueryaProductOffers>(AKTUERYA_DEFAULT_OFFERS)

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'product-categories'],
    queryFn: () => productCategoriesService.list(),
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () => adminProductsService.getById(id!),
    enabled: !isNew && Boolean(id),
  })

  useEffect(() => {
    if (!data) return
    const loaded: AdminProductInput = {
      name: data.name,
      slug: data.slug,
      productType: data.productType,
      shortDescription: data.shortDescription,
      description: data.description,
      price: data.price,
      compareAtPrice: data.compareAtPrice,
      currency: data.currency || 'TRY',
      isActive: data.isActive,
      purchaseEnabled: data.purchaseEnabled,
      licenseMonths: data.licenseMonths,
      licenseRequired: data.licenseRequired,
      licenseAppCode: data.licenseAppCode,
      licenseDays: data.licenseDays ?? 365,
      licenseMaxDevices: data.licenseMaxDevices ?? 1,
      featureBullets: data.featureBullets ?? '',
      isFeatured: data.isFeatured,
      sortOrder: data.sortOrder,
      version: data.version ?? '',
      categoryId: data.categoryId,
      seoTitle: data.seoTitle ?? '',
      seoDescription: data.seoDescription ?? '',
      coverImageMediaId: data.coverImageMediaId,
      downloadMediaId: data.downloadMediaId,
      coverImage: data.coverImage ?? '',
      downloadUrl:
        data.downloadUrl && data.downloadMedia?.url && data.downloadUrl.trim() === data.downloadMedia.url.trim()
          ? ''
          : (data.downloadUrl ?? ''),
      downloadFiles: buildAdminDownloadFilesFormState(data.downloadFiles, data.downloadUrl),
    }
    setForm(loaded)
    setPresetId(inferPresetFromForm(loaded))
    setGalleryRows(
      (data.galleryImages ?? [])
        .filter((g) => g.mediaId && g.url)
        .map((g) => ({
          key: g.id,
          mediaId: g.mediaId,
          preview: resolveMediaUrl(g.url),
        })),
    )
    setCoverPreviewUrl(
      data.coverMedia?.url
        ? resolveMediaUrl(data.coverMedia.url)
        : data.coverImage
          ? resolveMediaUrl(data.coverImage)
          : null,
    )
    setDownloadInfo(
      data.downloadMedia
        ? { name: data.downloadMedia.originalName, size: data.downloadMedia.fileSize }
        : null,
    )
    setUseCoverUrl(Boolean(data.coverImage && !data.coverImageMediaId))
    setSlugManual(true)
    // Yalnızca ürün kaydı ilk yüklendiğinde hydrate et; arka plan refetch formu sıfırlamaz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id])

  const coverPreview = useMemo(() => {
    if (useCoverUrl && form.coverImage?.trim()) return resolveMediaUrl(form.coverImage)
    if (coverPreviewUrl) return coverPreviewUrl
    if (form.coverImageMediaId && data?.coverMedia?.url) return resolveMediaUrl(data.coverMedia.url)
    const raw = data?.coverImage
    return raw ? resolveMediaUrl(raw) : null
  }, [useCoverUrl, form.coverImage, coverPreviewUrl, form.coverImageMediaId, data])

  const isBhPlans = !isNew && form.slug === BILIRKISI_HESAP_SLUG
  const isAktueryaPlans = form.slug.trim().toLowerCase() === AKTUERYA_PRODUCT_SLUG
  const alreadyPublished = Boolean(data?.isActive)
  const publicGalleryQuery = useQuery({
    queryKey: ['page-content', 'productPages', 'gallery', form.slug],
    enabled: !isNew && alreadyPublished && !coverPreview && Boolean(form.slug),
    queryFn: async () => {
      const res = await publicApi.get<{ success?: boolean; data?: unknown }>('/page-content/productPages')
      return publishedProductGalleryUrls(res.data?.data, form.slug)
    },
    staleTime: 60_000,
  })
  const publishedCoverUrl =
    alreadyPublished && !coverPreview ? (publicGalleryQuery.data?.[0] ?? null) : null
  const effectiveCoverPreview = coverPreview || publishedCoverUrl
  const hasCover = hasAdminCoverImage(form, effectiveCoverPreview)

  useEffect(() => {
    if (!isBhPlans) return
    let cancelled = false
    setBhPriceReady(false)
    setBhPriceError(null)
    adminBhService
      .getProduct()
      .then((product) => {
        if (cancelled) return
        const monthly = Number(formatTlInput(product.priceMonthly ?? product.monthlyPrice))
        const annual = Number(formatTlInput(product.price))
        setBhProduct(product)
        setBhDesktop(bhDesktopFromProduct(product))
        setMonthlyPriceTl(Number.isFinite(monthly) ? monthly : null)
        if (Number.isFinite(annual)) setForm((prev) => ({ ...prev, price: annual }))
        setBhPriceReady(true)
      })
      .catch((err) => {
        if (cancelled) return
        setBhPriceError(getErrorMessage(err))
        setBhPriceReady(false)
      })
    return () => {
      cancelled = true
    }
  }, [isBhPlans])

  useEffect(() => {
    if (data?.slug !== AKTUERYA_PRODUCT_SLUG || !data.aktueryaOffers) return
    setAktueryaOffers(data.aktueryaOffers)
  }, [data?.id, data?.slug, data?.aktueryaOffers])

  const bannerError =
    form.isActive && !hasCover
      ? PUBLISH_IMAGE_REQUIRED_MESSAGE
      : formError && formError !== PUBLISH_IMAGE_REQUIRED_MESSAGE
        ? formError
        : null

  const savePayloadPreview = useMemo(
    () =>
      buildAdminProductSavePayload({
        form,
        presetId,
        useCoverUrl,
        galleryMediaIds: collectGalleryMediaIdsForSave(galleryRows),
        isNew,
        existingDownloadFiles: isNew ? null : data?.downloadFiles,
      }),
    [form, presetId, useCoverUrl, galleryRows, isNew, data?.downloadFiles],
  )

  const update = <K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === 'name' && !slugManual) next.slug = slugifySoftwareName(String(value))
      return next
    })
  }

  const onPresetChange = (nextPreset: AdminProductPresetId) => {
    setPresetId(nextPreset)
    setForm((prev) => applyProductPreset(nextPreset, prev))
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const err = validateAdminProductForm(form, presetId, effectiveCoverPreview)
      if (err) {
        setTab(tabForValidationError(err))
        throw new Error(err)
      }
      if (isBhPlans) {
        if (!bhPriceReady || !bhProduct || monthlyPriceTl == null) {
          setTab('pricing')
          throw new Error(bhPriceError || 'Aylık ve yıllık fiyatlar yüklenemedi.')
        }
        if (!Number.isFinite(monthlyPriceTl) || monthlyPriceTl < 0) {
          setTab('pricing')
          throw new Error('Geçerli bir aylık fiyat girin.')
        }
        if (!isPositiveIntText(bhDesktop.windowsDeviceLimit) || !isPositiveIntText(bhDesktop.macosDeviceLimit)) {
          setTab('pricing')
          throw new Error('Cihaz limiti 1 veya daha büyük bir tam sayı olmalıdır.')
        }
        if (!isPositiveIntText(bhDesktop.windowsTrialDays) || !isPositiveIntText(bhDesktop.macosTrialDays)) {
          setTab('pricing')
          throw new Error('Ücretsiz deneme süresi 1 veya daha büyük bir tam sayı olmalıdır.')
        }
        const windowsInstallerError = bhDesktopInstallerFieldError(bhDesktop.windowsDownloadUrl, 'windows')
        const macosInstallerError = bhDesktopInstallerFieldError(bhDesktop.macosDownloadUrl, 'macos')
        if (windowsInstallerError || macosInstallerError) {
          setTab('delivery')
          throw new Error(windowsInstallerError || macosInstallerError || 'Kurulum dosyası geçersiz.')
        }
        if (bhDesktop.windowsFileSize.trim().length > 64 || bhDesktop.macosFileSize.trim().length > 64) {
          setTab('delivery')
          throw new Error('Dosya boyutu en fazla 64 karakter olabilir.')
        }
        if (
          bhDesktop.windowsDownloadButtonLabel.trim().length > 80 ||
          bhDesktop.macosDownloadButtonLabel.trim().length > 80
        ) {
          setTab('delivery')
          throw new Error('İndirme butonu başlığı en fazla 80 karakter olabilir.')
        }
        await adminBhService.updateProduct({
          name: bhProduct.name,
          price: String(form.price),
          priceMonthly: String(monthlyPriceTl),
          monthlyPrice: String(monthlyPriceTl),
          originalPrice:
            bhProduct.originalPrice != null ? formatTlInput(bhProduct.originalPrice) : undefined,
          price2Year:
            bhProduct.price2Year != null ? (Number(bhProduct.price2Year) / 100).toFixed(2) : undefined,
          originalPrice2Year:
            bhProduct.originalPrice2Year != null
              ? (Number(bhProduct.originalPrice2Year) / 100).toFixed(2)
              : undefined,
          price3Year:
            bhProduct.price3Year != null ? (Number(bhProduct.price3Year) / 100).toFixed(2) : undefined,
          originalPrice3Year:
            bhProduct.originalPrice3Year != null
              ? (Number(bhProduct.originalPrice3Year) / 100).toFixed(2)
              : undefined,
          price2YearActive: bhProduct.price2YearActive,
          price3YearActive: bhProduct.price3YearActive,
          imageUrl: bhProduct.imageUrl || '',
          shortDescription: bhProduct.shortDescription || '',
          longDescription: bhProduct.longDescription || '',
          features: bhProduct.features || '[]',
          targetAudience: bhProduct.targetAudience || '[]',
          trustInfo: bhProduct.trustInfo || '{}',
          isActive: bhProduct.isActive !== false,
          windowsPriceYearly: bhDesktop.windowsYearlyTl,
          windowsSalesEnabled: bhDesktop.windowsSalesEnabled,
          windowsDeviceLimit: bhDesktop.windowsDeviceLimit.trim(),
          windowsTrialDays: bhDesktop.windowsTrialDays.trim(),
          windowsDownloadUrl: bhDesktop.windowsDownloadUrl.trim(),
          windowsVersion: bhDesktop.windowsVersion.trim(),
          windowsFileSize: bhDesktop.windowsFileSize.trim(),
          windowsDownloadButtonLabel: bhDesktop.windowsDownloadButtonLabel.trim(),
          macosPriceYearly: bhDesktop.macosYearlyTl,
          macosSalesEnabled: bhDesktop.macosSalesEnabled,
          macosDeviceLimit: bhDesktop.macosDeviceLimit.trim(),
          macosTrialDays: bhDesktop.macosTrialDays.trim(),
          macosDownloadUrl: bhDesktop.macosDownloadUrl.trim(),
          macosVersion: bhDesktop.macosVersion.trim(),
          macosFileSize: bhDesktop.macosFileSize.trim(),
          macosDownloadButtonLabel: bhDesktop.macosDownloadButtonLabel.trim(),
        })
      }
      if (isAktueryaPlans) {
        const offerError = aktueryaOffersError(aktueryaOffers)
        if (offerError) {
          setTab('pricing')
          throw new Error(offerError)
        }
      }

      const payload = buildAdminProductSavePayload({
        form,
        presetId,
        useCoverUrl,
        galleryMediaIds: collectGalleryMediaIdsForSave(galleryRows),
        isNew,
        existingDownloadFiles: isNew ? null : data?.downloadFiles,
      })

      if (isAktueryaPlans) {
        payload.price = aktueryaOffers.web.yearlyTl
        payload.aktueryaOffers = aktueryaOffers
        payload.productType = 'SAAS'
        payload.licenseRequired = true
        payload.licenseAppCode = AKTUERYA_SAAS_APP_CODE
        payload.licenseDays = 365
      }

      if (isNew) return adminProductsService.create(payload)
      return adminProductsService.update(id!, payload)
    },
    onSuccess: () => {
      toast(isNew ? 'Ürün oluşturuldu' : 'Ürün güncellendi', 'success')
      navigate('/admin/products')
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const onCoverSelect = (media: CatalogMedia) => {
    setUseCoverUrl(false)
    setForm((p) => ({ ...p, coverImageMediaId: media.id, coverImage: '' }))
    setCoverPreviewUrl(resolveMediaUrl(media.url))
    if (formError === PUBLISH_IMAGE_REQUIRED_MESSAGE) setFormError(null)
  }

  const onGallerySelect = (media: CatalogMedia) => {
    if (media.fileType !== 'IMAGE') return
    if (galleryRows.some((r) => r.mediaId === media.id)) return
    setGalleryRows((rows) => {
      if (rows.length >= PRODUCT_GALLERY_MAX_IMAGES) return rows
      return [...rows, { key: `${media.id}-${Date.now()}`, mediaId: media.id, preview: resolveMediaUrl(media.url) }]
    })
  }

  const onDownloadSelect = (media: CatalogMedia) => {
    setForm((p) => ({ ...p, downloadMediaId: media.id }))
    setDownloadInfo({ name: media.originalName, size: media.fileSize })
  }

  if (!isNew && isLoading) return <LoadingState label="Ürün yükleniyor…" />
  if (!isNew && isError) return <EmptyState title="Ürün bulunamadı" description="Kayıt yüklenemedi." />

  const showDownload = presetShowsDownloadFields(presetId)
  const showR2Downloads = presetShowsR2DownloadFields(presetId)
  const showLicense = presetShowsLicenseFields(presetId)
  const showSaas = presetShowsSaasFields(presetId)

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title={isNew ? 'Yeni ürün' : 'Ürün düzenle'}
        description="Ürün tipine göre yönlendirilen sekmeli form — fiyat, teslimat ve merkezi lisans ayarları."
        actions={
          <Link
            to="/admin/products"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Ürün listesi
          </Link>
        }
      />

      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-medium text-slate-800">Ürün tipi</p>
          <p className="text-xs text-slate-500">
            Tip seçildiğinde yalnızca ilgili alanlar gösterilir. Public tarafta satışa açık ve fiyatlı ürünlerde ana
            buton <strong>Sepete Ekle</strong> olur.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {ADMIN_PRODUCT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onPresetChange(preset.id)}
                className={cn(
                  'rounded-xl border px-4 py-3 text-left transition',
                  presetId === preset.id
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-100'
                    : 'border-slate-200 bg-white hover:border-brand-200',
                )}
              >
                <span className="block text-sm font-semibold text-slate-900">{preset.label}</span>
                <span className="mt-1 block text-xs leading-snug text-slate-500">{preset.description}</span>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setFormError(null)
          void saveMutation.mutateAsync()
        }}
      >
        {bannerError ? (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardBody>
              <p className="text-sm text-red-700">{bannerError}</p>
            </CardBody>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-1">
          {PRODUCT_FORM_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition',
                tab === t.id ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="min-w-0 space-y-6">
            {tab === 'basic' ? (
              <Card>
                <CardBody className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Ürün adı"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      required
                    />
                    <Input
                      label="Slug (URL adresi)"
                      value={form.slug}
                      onChange={(e) => {
                        setSlugManual(true)
                        update('slug', e.target.value)
                      }}
                    />
                    <p className="text-xs text-slate-500 sm:col-span-2">
                      Ad yazıldıkça otomatik oluşur; isterseniz düzenleyebilirsiniz.
                    </p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
                    <select
                      value={form.categoryId ?? ''}
                      onChange={(e) => update('categoryId', e.target.value || null)}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    >
                      <option value="">— Kategori seçin (opsiyonel) —</option>
                      {(categoriesQuery.data ?? []).map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-slate-500">
                      Kategori yönetimi V4&apos;te henüz ayrı sayfa değil
                    </p>
                  </div>
                  <Input
                    label="Kısa açıklama"
                    value={form.shortDescription}
                    onChange={(e) => update('shortDescription', e.target.value)}
                  />
                  <TextArea
                    label="Detay açıklama"
                    value={form.description}
                    onChange={(v) => update('description', v)}
                    rows={6}
                  />
                  <TextArea
                    label="Öne çıkan özellikler"
                    value={form.featureBullets}
                    onChange={(v) => update('featureBullets', v)}
                    rows={6}
                    hint="Her satır bir madde olarak ürün detayında listelenir."
                  />
                  {presetId !== 'SERVICE' ? (
                    <Input
                      label="Sürüm"
                      value={form.version}
                      onChange={(e) => update('version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'pricing' ? (
              <Card>
                <CardBody className="space-y-4">
                  <HelpBox>
                    Bu ürünü satışa açmak için fiyat ve &quot;Satışa açık&quot; alanını doldurun. Fiyat yoksa public
                    tarafta <strong>Teklif Al</strong> gösterilir; Sepete Ekle aktif olmaz.
                  </HelpBox>
                  {isBhPlans ? (
                    <p className="text-sm text-slate-600">
                      Web, Windows ve macOS fiyatları ayrıdır. Sitedeki satın alma mevcut Web fiyatlarını kullanır.
                    </p>
                  ) : null}
                  {isBhPlans && bhPriceError ? (
                    <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                      {bhPriceError}
                    </p>
                  ) : null}
                  {isBhPlans ? (
                    <div className="space-y-4">
                      <section className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">WEB / SaaS</h2>
                          <p className="text-xs text-slate-500">Web tabanlı sürüm</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <Input
                            label="Aylık fiyat"
                            type="number"
                            min={0}
                            step="0.01"
                            value={monthlyPriceTl ?? ''}
                            disabled={!bhPriceReady}
                            onChange={(e) =>
                              setMonthlyPriceTl(e.target.value === '' ? null : Number.parseFloat(e.target.value) || 0)
                            }
                          />
                          <Input
                            label="Yıllık fiyat"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.price}
                            disabled={!bhPriceReady}
                            onChange={(e) => update('price', Number.parseFloat(e.target.value) || 0)}
                          />
                          <Input
                            label="Eski fiyat (indirimli gösterim)"
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.compareAtPrice ?? ''}
                            onChange={(e) =>
                              update(
                                'compareAtPrice',
                                e.target.value === '' ? null : Number.parseFloat(e.target.value) || null,
                              )
                            }
                          />
                          <Input label="Para birimi" value={form.currency} readOnly />
                        </div>
                        <CheckboxField
                          label="Satışa açık"
                          checked={form.purchaseEnabled}
                          onChange={(v) => update('purchaseEnabled', v)}
                          description="Kapalıysa ürün görünse bile sepete eklenemez; Teklif Al veya bilgi kartı gösterilir."
                        />
                      </section>

                      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">WINDOWS MASAÜSTÜ</h2>
                          <p className="text-xs text-slate-500">Yalnızca yıllık lisans</p>
                        </div>
                        <Input
                          label="Yıllık fiyat (TL)"
                          type="number"
                          min={0}
                          step="0.01"
                          value={bhDesktop.windowsYearlyTl}
                          disabled={!bhPriceReady}
                          onChange={(e) =>
                            setBhDesktop((d) => ({ ...d, windowsYearlyTl: e.target.value }))
                          }
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            label="Cihaz limiti"
                            type="number"
                            min={1}
                            step={1}
                            value={bhDesktop.windowsDeviceLimit}
                            disabled={!bhPriceReady}
                            onChange={(e) =>
                              setBhDesktop((d) => ({ ...d, windowsDeviceLimit: e.target.value }))
                            }
                          />
                          <Input
                            label="Ücretsiz deneme süresi (gün)"
                            type="number"
                            min={1}
                            step={1}
                            value={bhDesktop.windowsTrialDays}
                            disabled={!bhPriceReady}
                            onChange={(e) =>
                              setBhDesktop((d) => ({ ...d, windowsTrialDays: e.target.value }))
                            }
                          />
                        </div>
                        <CheckboxField
                          label="Satışa açık"
                          checked={bhDesktop.windowsSalesEnabled}
                          onChange={(v) => setBhDesktop((d) => ({ ...d, windowsSalesEnabled: v }))}
                          description="Windows satışı macOS satışından bağımsızdır. Satın alma bu aşamada bağlanmaz."
                        />
                      </section>

                      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
                        <div>
                          <h2 className="text-sm font-semibold text-slate-900">macOS MASAÜSTÜ</h2>
                          <p className="text-xs text-slate-500">Yalnızca yıllık lisans</p>
                        </div>
                        <Input
                          label="Yıllık fiyat (TL)"
                          type="number"
                          min={0}
                          step="0.01"
                          value={bhDesktop.macosYearlyTl}
                          disabled={!bhPriceReady}
                          onChange={(e) => setBhDesktop((d) => ({ ...d, macosYearlyTl: e.target.value }))}
                        />
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            label="Cihaz limiti"
                            type="number"
                            min={1}
                            step={1}
                            value={bhDesktop.macosDeviceLimit}
                            disabled={!bhPriceReady}
                            onChange={(e) => setBhDesktop((d) => ({ ...d, macosDeviceLimit: e.target.value }))}
                          />
                          <Input
                            label="Ücretsiz deneme süresi (gün)"
                            type="number"
                            min={1}
                            step={1}
                            value={bhDesktop.macosTrialDays}
                            disabled={!bhPriceReady}
                            onChange={(e) => setBhDesktop((d) => ({ ...d, macosTrialDays: e.target.value }))}
                          />
                        </div>
                        <CheckboxField
                          label="Satışa açık"
                          checked={bhDesktop.macosSalesEnabled}
                          onChange={(v) => setBhDesktop((d) => ({ ...d, macosSalesEnabled: v }))}
                          description="macOS satışı Windows satışından bağımsızdır. Satın alma bu aşamada bağlanmaz."
                        />
                      </section>
                    </div>
                  ) : isAktueryaPlans ? (
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">
                        Web, Windows ve macOS fiyatları bu ürün kaydının içindedir. Katalog liste fiyatı web yıllık fiyattır.
                      </p>
                      <AktueryaPriceFields
                        title="WEB / SaaS"
                        hint="Tarayıcıdan kullanım"
                        licenseLabel={`${AKTUERYA_SAAS_APP_CODE} · plan monthly / yearly`}
                        prices={aktueryaOffers.web}
                        onChange={(web) => {
                          setAktueryaOffers((prev) => ({ ...prev, web }))
                          update('price', web.yearlyTl)
                        }}
                      />
                      <AktueryaPriceFields
                        title="WINDOWS"
                        hint="Windows masaüstü"
                        licenseLabel={`${AKTUERYA_DESKTOP_APP_CODE} · platform WINDOWS`}
                        prices={aktueryaOffers.windows}
                        showDeviceLimit
                        onChange={(windows) => setAktueryaOffers((prev) => ({ ...prev, windows }))}
                      />
                      <AktueryaPriceFields
                        title="macOS"
                        hint="Mac masaüstü"
                        licenseLabel={`${AKTUERYA_DESKTOP_APP_CODE} · platform MACOS`}
                        prices={aktueryaOffers.macos}
                        showDeviceLimit
                        onChange={(macos) => setAktueryaOffers((prev) => ({ ...prev, macos }))}
                      />
                      <CheckboxField
                        label="Satışa açık"
                        checked={form.purchaseEnabled}
                        onChange={(v) => update('purchaseEnabled', v)}
                        description="Kapalıysa ürün görünse bile sepete eklenemez."
                      />
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Input
                          label="Satış fiyatı"
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.price}
                          onChange={(e) => update('price', Number.parseFloat(e.target.value) || 0)}
                        />
                        <Input
                          label="Eski fiyat (indirimli gösterim)"
                          type="number"
                          min={0}
                          step="0.01"
                          value={form.compareAtPrice ?? ''}
                          onChange={(e) =>
                            update(
                              'compareAtPrice',
                              e.target.value === '' ? null : Number.parseFloat(e.target.value) || null,
                            )
                          }
                        />
                        <Input label="Para birimi" value={form.currency} readOnly />
                      </div>
                      <CheckboxField
                        label="Satışa açık"
                        checked={form.purchaseEnabled}
                        onChange={(v) => update('purchaseEnabled', v)}
                        description="Kapalıysa ürün görünse bile sepete eklenemez; Teklif Al veya bilgi kartı gösterilir."
                      />
                    </>
                  )}
                  {data?.deliveryLinkMissing && showDownload ? (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                      Uyarı: Bu ürün için teslimat dosyası veya indirme adresi eksik.
                    </p>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'delivery' ? (
              <Card>
                <CardBody className="space-y-5">
                  {presetId === 'SERVICE' ? (
                    <HelpBox>
                      Hizmet / teklif ürünlerinde indirme ve lisans alanları kullanılmaz. Satışa kapalı bırakın veya
                      fiyat girmeden teklif akışını kullanın.
                    </HelpBox>
                  ) : null}

                  {presetId === 'FREE_TOOL' ? (
                    <HelpBox>
                      Ücretsiz araçlarda sepete ekleme kapalıdır. R2 indirme dosyalarını aşağıdan tanımlayın; public
                      ürün sayfasında doğrudan indirme butonları gösterilir.
                    </HelpBox>
                  ) : null}

                  {showR2Downloads ? (
                    <ProductR2DownloadFilesSection
                      value={form.downloadFiles ?? emptyDownloadFilesConfig()}
                      onChange={(downloadFiles) => setForm((p) => ({ ...p, downloadFiles }))}
                      showFreeFlags={presetId === 'FREE_TOOL' || presetId === 'DOWNLOADABLE' || presetId === 'LICENSED'}
                    />
                  ) : null}

                  {showDownload ? (
                    <div className="space-y-3 rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-medium text-slate-800">Dijital dosya teslimatı</p>
                      <HelpBox>
                        Dijital teslimat için dosya seçerseniz ödeme sonrası e-posta ile gönderilir ve ödeme onaylı
                        siparişlerde müşteri hesabından indirilebilir.
                      </HelpBox>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => setDownloadPickerOpen(true)}>
                          Medyadan dosya seç (ZIP / EXE / PDF…)
                        </Button>
                        {form.downloadMediaId ? (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setForm((p) => ({ ...p, downloadMediaId: null }))
                              setDownloadInfo(null)
                            }}
                          >
                            Seçimi kaldır
                          </Button>
                        ) : null}
                      </div>
                      {downloadInfo ? (
                        <p className="text-sm text-slate-700">
                          {downloadInfo.name} — {(downloadInfo.size / 1024).toFixed(1)} KB
                        </p>
                      ) : null}
                      <Input
                        label="Alternatif indirme URL"
                        value={form.downloadUrl ?? ''}
                        onChange={(e) => update('downloadUrl', e.target.value)}
                        placeholder="https://… veya R2 medya adresi"
                      />
                      <p className="text-xs text-slate-500">
                        Medya kütüphanesinden dosya seçmezseniz doğrudan URL girebilirsiniz.
                      </p>
                    </div>
                  ) : null}

                  {showLicense && presetId === 'LICENSED' ? (
                    <div className="space-y-4">
                      <CentralLicenseInfoBanner
                        extra="Lisans program kodu, merkezi lisans server'daki appCode ile aynı olmalıdır."
                      />
                      <CheckboxField
                        label="Merkezi lisans gerekli"
                        checked={form.licenseRequired}
                        onChange={(v) => {
                          setForm((p) => ({
                            ...p,
                            licenseRequired: v,
                            licenseAppCode: v ? p.licenseAppCode : null,
                          }))
                        }}
                        description="Ödeme onayından sonra merkezi Woontegra Lisans Server'a bildirilir; lisans bilgileri müşteriye e-posta ile iletilir."
                      />
                      {form.licenseRequired ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <LicenseProgramPicker
                              value={form.licenseAppCode}
                              onChange={(appCode) => update('licenseAppCode', appCode)}
                            />
                          </div>
                          <Input
                            label="Lisans süresi (gün)"
                            type="number"
                            min={1}
                            max={3650}
                            value={form.licenseDays ?? 365}
                            onChange={(e) => update('licenseDays', Number.parseInt(e.target.value, 10) || 365)}
                          />
                          <Input
                            label="Cihaz limiti"
                            type="number"
                            min={1}
                            max={50}
                            value={form.licenseMaxDevices ?? 1}
                            onChange={(e) =>
                              update('licenseMaxDevices', Number.parseInt(e.target.value, 10) || 1)
                            }
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {showSaas ? (
                    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {isBhPlans ? 'WEB / SaaS Teslimatı' : 'SaaS / abonelik teslimatı'}
                        </p>
                        {isBhPlans ? (
                          <p className="mt-1 text-xs text-slate-500">SaaS / abonelik teslimatı</p>
                        ) : null}
                      </div>
                      <Input
                        label="Abonelik süresi (ay)"
                        type="number"
                        min={1}
                        max={120}
                        value={form.licenseMonths}
                        onChange={(e) => update('licenseMonths', Number.parseInt(e.target.value, 10) || 12)}
                      />
                      <p className="text-xs text-slate-500">
                        Yıllık/aylık fiyatlandırma public detayda yıl seçimi ile çarpılır.
                      </p>
                      <CheckboxField
                        label="Merkezi lisans gerekiyor"
                        checked={form.licenseRequired}
                        onChange={(v) => {
                          setForm((p) => ({
                            ...p,
                            licenseRequired: v,
                            licenseAppCode: v ? p.licenseAppCode : null,
                          }))
                        }}
                      />
                      {form.licenseRequired ? (
                        <LicenseProgramPicker
                          value={form.licenseAppCode}
                          onChange={(appCode) => update('licenseAppCode', appCode)}
                        />
                      ) : null}
                      <TextArea
                        label="Teslimat açıklaması (detay sayfasında)"
                        value={form.shortDescription}
                        onChange={(v) => update('shortDescription', v)}
                        rows={3}
                        hint="Hesap bilgileri ve erişim süreci müşteriye e-posta ile iletilir."
                      />
                    </div>
                  ) : null}

                  {isBhPlans ? (
                    <div className="space-y-4">
                      <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                        <p className="text-sm font-semibold text-slate-900">Windows</p>
                        <Input
                          label="Kurulum dosyası URL'si"
                          value={bhDesktop.windowsDownloadUrl}
                          disabled={!bhPriceReady}
                          onChange={(e) =>
                            setBhDesktop((d) => ({ ...d, windowsDownloadUrl: e.target.value }))
                          }
                          placeholder="https://download.woontegra.com/downloads/bilirkisi-hesap/windows/....exe"
                        />
                        <Input
                          label="Sürüm"
                          value={bhDesktop.windowsVersion}
                          disabled={!bhPriceReady}
                          onChange={(e) => setBhDesktop((d) => ({ ...d, windowsVersion: e.target.value }))}
                          placeholder="3.6.1"
                        />
                        <Input
                          label="Dosya boyutu"
                          value={bhDesktop.windowsFileSize}
                          disabled={!bhPriceReady}
                          onChange={(e) => setBhDesktop((d) => ({ ...d, windowsFileSize: e.target.value }))}
                          placeholder="118 MB"
                        />
                        <Input
                          label="İndirme butonu başlığı"
                          value={bhDesktop.windowsDownloadButtonLabel}
                          disabled={!bhPriceReady}
                          onChange={(e) =>
                            setBhDesktop((d) => ({ ...d, windowsDownloadButtonLabel: e.target.value }))
                          }
                          placeholder="Windows kurulumunu indir"
                        />
                      </section>
                      <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                        <p className="text-sm font-semibold text-slate-900">macOS</p>
                        <Input
                          label="Kurulum dosyası URL'si"
                          value={bhDesktop.macosDownloadUrl}
                          disabled={!bhPriceReady}
                          onChange={(e) => setBhDesktop((d) => ({ ...d, macosDownloadUrl: e.target.value }))}
                          placeholder="https://download.woontegra.com/downloads/bilirkisi-hesap/macos/....dmg"
                        />
                        <Input
                          label="Sürüm"
                          value={bhDesktop.macosVersion}
                          disabled={!bhPriceReady}
                          onChange={(e) => setBhDesktop((d) => ({ ...d, macosVersion: e.target.value }))}
                          placeholder="3.6.1"
                        />
                        <Input
                          label="Dosya boyutu"
                          value={bhDesktop.macosFileSize}
                          disabled={!bhPriceReady}
                          onChange={(e) => setBhDesktop((d) => ({ ...d, macosFileSize: e.target.value }))}
                          placeholder="120 MB"
                        />
                        <Input
                          label="İndirme butonu başlığı"
                          value={bhDesktop.macosDownloadButtonLabel}
                          disabled={!bhPriceReady}
                          onChange={(e) =>
                            setBhDesktop((d) => ({ ...d, macosDownloadButtonLabel: e.target.value }))
                          }
                          placeholder="Mac kurulumunu indir"
                        />
                      </section>
                    </div>
                  ) : null}

                  {isAktueryaPlans ? (
                    <div className="space-y-4">
                      <section className="space-y-3 rounded-lg border border-slate-200 p-4">
                        <p className="text-sm font-semibold text-slate-900">WEB / SaaS teslimatı</p>
                        <p className="text-xs text-slate-600">
                          Uygulama kodu {AKTUERYA_SAAS_APP_CODE}. Aylık seçim plan monthly, yıllık seçim plan yearly
                          gönderir.
                        </p>
                      </section>
                      <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">WINDOWS teslimatı</p>
                          <p className="mt-1 text-xs text-slate-600">
                            {AKTUERYA_DESKTOP_APP_CODE} · platform WINDOWS
                          </p>
                        </div>
                        <Input
                          label="Kurulum bağlantısı"
                          value={aktueryaOffers.windows.downloadUrl}
                          onChange={(e) =>
                            setAktueryaOffers((prev) => ({
                              ...prev,
                              windows: { ...prev.windows, downloadUrl: e.target.value },
                            }))
                          }
                          placeholder="https://download.woontegra.com/....exe"
                        />
                      </section>
                      <section className="space-y-4 rounded-lg border border-slate-200 p-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">macOS teslimatı</p>
                          <p className="mt-1 text-xs text-slate-600">
                            {AKTUERYA_DESKTOP_APP_CODE} · platform MACOS
                          </p>
                        </div>
                        <Input
                          label="Kurulum bağlantısı"
                          value={aktueryaOffers.macos.downloadUrl}
                          onChange={(e) =>
                            setAktueryaOffers((prev) => ({
                              ...prev,
                              macos: { ...prev.macos, downloadUrl: e.target.value },
                            }))
                          }
                          placeholder="https://download.woontegra.com/....dmg"
                        />
                      </section>
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'media' ? (
              <Card>
                <CardBody className="space-y-6">
                  <p className="text-sm text-slate-600">
                    Kapak görseli ile teslimat dosyası ayrıdır. Görseller için IMAGE, indirilecek dosya için ZIP/EXE/PDF
                    seçin.
                  </p>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-sm font-medium text-slate-800">Kapak görseli</p>
                    <ImageUploadSizeNote spec="productCover" className="mb-3" />
                    <div className="flex flex-wrap items-start gap-4">
                      {coverPreview ? (
                        <SafeImage
                          src={coverPreview}
                          alt=""
                          className="h-24 w-36 rounded-lg border border-slate-200 object-cover"
                          productPlaceholder
                          placeholder
                        />
                      ) : (
                        <div className="flex h-24 w-36 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-slate-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                      <div className="min-w-[240px] flex-1 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" onClick={() => setCoverPickerOpen(true)}>
                            <Images className="h-4 w-4" />
                            Medya seç
                          </Button>
                          {form.coverImageMediaId ? (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setForm((p) => ({ ...p, coverImageMediaId: null }))
                                setCoverPreviewUrl(null)
                              }}
                            >
                              Seçimi kaldır
                            </Button>
                          ) : null}
                        </div>
                        <details className="text-sm text-slate-600">
                          <summary className="cursor-pointer font-medium">Alternatif: URL ile kapak</summary>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={useCoverUrl}
                                onChange={(e) => {
                                  setUseCoverUrl(e.target.checked)
                                  if (e.target.checked) {
                                    setForm((p) => ({ ...p, coverImageMediaId: null }))
                                    setCoverPreviewUrl(null)
                                  }
                                }}
                              />
                              URL modu
                            </label>
                            {useCoverUrl ? (
                              <Input
                                label="Kapak görsel URL"
                                hint={imageUploadSizeHint('productCover')}
                                value={form.coverImage ?? ''}
                                onChange={(e) => {
                                  update('coverImage', e.target.value)
                                  setCoverPreviewUrl(resolveMediaUrl(e.target.value))
                                }}
                                placeholder="/uploads/... veya https://..."
                              />
                            ) : null}
                          </div>
                        </details>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800">Ürün Ekran Görüntüleri</p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                          Ürün sayfasındaki ekran görüntüsü galerisinde gösterilir. Kapak görseli ayrıdır. En fazla{' '}
                          {PRODUCT_GALLERY_MAX_IMAGES} görsel.
                        </p>
                        <ImageUploadSizeNote spec="productGallery" className="mt-1" />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={galleryRows.length >= PRODUCT_GALLERY_MAX_IMAGES}
                        onClick={() => setGalleryPickerOpen(true)}
                      >
                        <Images className="h-4 w-4" />
                        Görsel Ekle
                      </Button>
                    </div>
                    {galleryRows.length === 0 ? (
                      <p className="text-sm text-slate-500">Henüz ekran görüntüsü seçilmedi.</p>
                    ) : (
                      <ul className="space-y-2">
                        {galleryRows.map((row, index) => (
                          <li
                            key={row.key}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2"
                          >
                            <SafeImage
                              src={row.preview}
                              alt={`Ekran görüntüsü ${index + 1}`}
                              className="h-16 w-24 shrink-0 rounded-lg border border-slate-200 object-cover"
                              productPlaceholder
                              placeholder
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800">
                                {index === 0 ? 'İlk slayt' : `Slayt ${index + 1}`}
                              </p>
                              <p className="text-xs text-slate-500">Sıra: {index + 1}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                disabled={index === 0}
                                onClick={() => setGalleryRows((rows) => moveGalleryRow(rows, index, -1))}
                                aria-label="Yukarı taşı"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                                disabled={index === galleryRows.length - 1}
                                onClick={() => setGalleryRows((rows) => moveGalleryRow(rows, index, 1))}
                                aria-label="Aşağı taşı"
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-red-50 hover:text-red-600"
                                onClick={() => setGalleryRows((rows) => rows.filter((r) => r.key !== row.key))}
                                aria-label="Kaldır"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {showDownload ? (
                    <div className="rounded-lg border border-slate-200 p-4">
                      <p className="mb-2 text-sm font-medium text-slate-800">Teslimat dosyası</p>
                      <p className="mb-3 text-xs text-slate-500">
                        Ödeme onayı sonrası müşteriye gönderilecek indirme dosyası — kapak görselinden ayrı seçilir.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => setDownloadPickerOpen(true)}>
                          Teslimat dosyası seç
                        </Button>
                      </div>
                      {downloadInfo ? (
                        <p className="mt-2 text-sm text-slate-700">
                          {downloadInfo.name} — {(downloadInfo.size / 1024).toFixed(1)} KB
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            ) : null}

            {tab === 'seo' ? (
              <Card>
                <CardBody className="space-y-4">
                  <Input
                    label="SEO başlık"
                    value={form.seoTitle ?? ''}
                    onChange={(e) => update('seoTitle', e.target.value)}
                  />
                  <TextArea
                    label="SEO açıklama"
                    value={form.seoDescription ?? ''}
                    onChange={(v) => update('seoDescription', v)}
                    rows={3}
                  />
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <p className="font-medium text-slate-700">Canonical önizleme</p>
                    <p className="mt-1 font-mono text-xs text-brand-700">
                      /yazilimlar/{form.slug.trim() || slugifySoftwareName(form.name) || 'slug'}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <CheckboxField
                      label="Yayında (aktif)"
                      checked={form.isActive}
                      onChange={(v) => update('isActive', v)}
                      description="Pasif ürünler public listede görünmez."
                    />
                    <CheckboxField
                      label="Öne çıkan"
                      checked={form.isFeatured}
                      onChange={(v) => update('isFeatured', v)}
                    />
                  </div>
                  <Input
                    label="Sıralama"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => update('sortOrder', Number.parseInt(e.target.value, 10) || 0)}
                  />
                  <p className="text-xs text-slate-500">Küçük değerler listede önce görünür.</p>
                  <details className="rounded-lg border border-slate-200 bg-slate-50">
                    <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700">
                      Kayıt payload önizleme
                    </summary>
                    <pre className="max-h-64 overflow-auto border-t border-slate-200 px-3 py-2 text-xs text-slate-700">
                      {JSON.stringify(savePayloadPreview, null, 2)}
                    </pre>
                  </details>
                </CardBody>
              </Card>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <ProductFormSummary
              form={form}
              presetId={presetId}
              coverPreview={effectiveCoverPreview}
              monthlyPriceTl={isBhPlans ? monthlyPriceTl : null}
            />
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-1 mt-6 border-t border-slate-200 bg-white/95 px-1 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/80">
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/admin/products')}>
              İptal
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? 'Kaydediliyor…' : isNew ? 'Oluştur' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </form>

      <div className="lg:hidden">
        <ProductFormSummary
          form={form}
          presetId={presetId}
          coverPreview={effectiveCoverPreview}
          monthlyPriceTl={isBhPlans ? monthlyPriceTl : null}
        />
      </div>

      <MediaPickerModal
        open={coverPickerOpen}
        title="Kapak görseli seç"
        allowedTypes={['IMAGE']}
        onClose={() => setCoverPickerOpen(false)}
        onSelect={onCoverSelect}
        uploadFolder="products"
      />
      <MediaPickerModal
        open={galleryPickerOpen}
        title="Ekran görüntüsü ekle"
        allowedTypes={['IMAGE']}
        onClose={() => setGalleryPickerOpen(false)}
        onSelect={onGallerySelect}
        uploadFolder="products"
      />
      <MediaPickerModal
        open={downloadPickerOpen}
        title="Teslimat dosyası seç"
        allowedTypes={['DOWNLOAD', 'DOCUMENT']}
        onClose={() => setDownloadPickerOpen(false)}
        onSelect={onDownloadSelect}
      />
    </div>
  )
}
