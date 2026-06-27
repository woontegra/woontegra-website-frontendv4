import type { AdminProductInput } from '@/types/product'
import { slugifySoftwareName } from '@/types/product'
import type { AdminProductPresetId } from '@/constants/adminProductPresets'
import { resolveDownloadFilesSavePayload } from '@/lib/productDownloadFiles'

type BuildPayloadArgs = {
  form: AdminProductInput
  presetId: AdminProductPresetId
  useCoverUrl: boolean
  galleryMediaIds: string[]
  isNew: boolean
  existingDownloadFiles?: unknown | null
}

/** V3 ile aynı kayıt payload mantığı — boş downloadFiles ile mevcut R2 verisini ezmez. */
export function buildAdminProductSavePayload(args: BuildPayloadArgs): AdminProductInput {
  const { form, presetId, useCoverUrl, galleryMediaIds, isNew, existingDownloadFiles } = args

  const downloadFilesPayload = resolveDownloadFilesSavePayload(
    form.downloadFiles,
    isNew ? null : existingDownloadFiles,
  )

  return {
    ...form,
    name: form.name.trim(),
    slug: (form.slug.trim() || slugifySoftwareName(form.name)).toLowerCase(),
    shortDescription: form.shortDescription.trim(),
    description: form.description.trim(),
    currency: form.currency.trim() || 'TRY',
    version: form.version.trim(),
    compareAtPrice:
      form.compareAtPrice === null || form.compareAtPrice === 0 ? null : form.compareAtPrice,
    categoryId: form.categoryId || null,
    seoTitle: form.seoTitle?.trim() || '',
    seoDescription: form.seoDescription?.trim() || '',
    coverImageMediaId: useCoverUrl ? null : form.coverImageMediaId ?? null,
    downloadMediaId: form.downloadMediaId ?? null,
    galleryMediaIds,
    licenseRequired: presetId === 'LICENSED' ? true : form.licenseRequired,
    licenseAppCode: presetId === 'LICENSED' || form.licenseRequired ? form.licenseAppCode : null,
    licenseDays: presetId === 'LICENSED' || form.licenseRequired ? form.licenseDays : null,
    licenseMaxDevices: presetId === 'LICENSED' || form.licenseRequired ? form.licenseMaxDevices : null,
    coverImage: useCoverUrl ? (form.coverImage ?? '').trim() : undefined,
    downloadUrl: (form.downloadUrl ?? '').trim() || undefined,
    ...(downloadFilesPayload !== undefined ? { downloadFiles: downloadFilesPayload } : {}),
  }
}
