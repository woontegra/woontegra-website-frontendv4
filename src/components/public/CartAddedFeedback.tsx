import { Link } from 'react-router-dom'

type Props = {
  message?: string
  onContinue?: () => void
}

export function CartAddedFeedback({ message = 'Ürün sepete eklendi.', onContinue }: Props) {
  return (
    <div
      className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-emerald-900">{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          to="/sepet"
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Sepete git
        </Link>
        {onContinue ? (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex items-center rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            Alışverişe devam et
          </button>
        ) : (
          <Link
            to="/yazilimlar"
            className="inline-flex items-center rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
          >
            Alışverişe devam et
          </Link>
        )}
      </div>
    </div>
  )
}
