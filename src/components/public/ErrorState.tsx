import type { ReactNode } from 'react'

type Props = {
  title?: string
  message: string
  action?: ReactNode
}

export function ErrorState({ title = 'Bir hata oluştu', message, action }: Props) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <h3 className="text-lg font-semibold text-red-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-red-700">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
