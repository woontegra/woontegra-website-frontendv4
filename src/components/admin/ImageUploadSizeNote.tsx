import type { ImageUploadSpecKey } from '@/constants/imageUploadSpecs'
import { IMAGE_UPLOAD_SPECS } from '@/constants/imageUploadSpecs'
import { cn } from '@/lib/cn'

type Props = {
  spec: ImageUploadSpecKey
  className?: string
}

export function ImageUploadSizeNote({ spec, className }: Props) {
  return (
    <p className={cn('text-xs leading-relaxed text-slate-500', className)}>
      {IMAGE_UPLOAD_SPECS[spec].hint}
    </p>
  )
}
