import { Link, Outlet } from 'react-router-dom'
import { AccountNav } from '@/components/account/AccountNav'
import { useCustomerSession } from '@/hooks/useCustomerSession'

export function AccountLayout() {
  const { profile } = useCustomerSession()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50/90 via-white to-slate-50/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/90">Müşteri paneli</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Hesabım</h1>
              {profile ? (
                <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-slate-600">
                  <span className="font-medium text-slate-800">{profile.name}</span>
                  <span className="hidden text-slate-300 sm:inline" aria-hidden>
                    ·
                  </span>
                  <span className="truncate">{profile.email}</span>
                </div>
              ) : null}
            </div>
            <Link
              to="/yazilimlar"
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              Alışverişe devam
            </Link>
          </div>
        </header>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-10">
          <AccountNav />
          <main className="min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm sm:p-7 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
