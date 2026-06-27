import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useBuilderEditContext } from '@/builder/edit/BuilderEditContext'

export type BuilderFieldType = 'text' | 'media' | 'button' | 'card' | 'faq'

type Props = {
  path: string
  label: string
  type?: BuilderFieldType
  className?: string
  children: ReactNode
}

/**
 * Edit modunda canvas'ta alan sınırlarını işaretler.
 * Public sitede (annotateFields=false) children olduğu gibi render edilir.
 */
export function BuilderField({ path, label, type = 'text', className, children }: Props) {
  const { annotateFields } = useBuilderEditContext()
  if (!annotateFields) return <>{children}</>

  return (
    <div
      className={cn('builder-field-root relative', className)}
      data-builder-field=""
      data-builder-field-path={path}
      data-builder-field-label={label}
      data-builder-field-type={type}
    >
      {children}
    </div>
  )
}
