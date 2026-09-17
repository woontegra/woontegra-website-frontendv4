import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  DollarSign,
  Eye,
  FileText,
  Radio,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PageHeader } from '@/components/ui/PageHeader'
import { adminBhService, getErrorMessage } from '@/services/adminBhService'
import { formatBhKurus } from '@/utils/bhAdminUi'

type MetricBlock = {
  pageViews: number
  demoRequests: number
  users: number
  payments: number
  revenue: number
}

type DailyPoint = MetricBlock & { date: string }

type AnalyticsShape = {
  total?: MetricBlock
  today?: MetricBlock
  yesterday?: MetricBlock
  daily?: DailyPoint[]
  activeLast5Min?: number
  activeLast5MinNote?: string | null
}

function num(n: number | null | undefined): string {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return new Intl.NumberFormat('tr-TR').format(Number(n))
}

function pctChange(today: number, yesterday: number): string | undefined {
  if (!Number.isFinite(today) || !Number.isFinite(yesterday) || yesterday === 0) return undefined
  const pct = ((today - yesterday) / yesterday) * 100
  const sign = pct > 0 ? '+' : ''
  return `Düne göre ${sign}${pct.toFixed(0)}%`
}

function Metric({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Eye
}) {
  return (
    <Card>
      <CardBody className="flex h-[88px] flex-col justify-between py-3">
        <div className="flex items-start gap-2">
          <span className="rounded-md bg-slate-800 p-1.5 text-white">
            <Icon className="h-3.5 w-3.5" />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        </div>
        <div>
          <p className="text-xl font-semibold tabular-nums text-slate-900">{value}</p>
          {hint ? <p className="mt-0.5 truncate text-[11px] text-slate-500">{hint}</p> : null}
        </div>
      </CardBody>
    </Card>
  )
}

function MiniBarChart({
  points,
  valueKey,
}: {
  points: DailyPoint[]
  valueKey: 'demoRequests' | 'pageViews' | 'payments' | 'revenue'
}) {
  const max = Math.max(1, ...points.map((p) => Number(p[valueKey] || 0)))
  return (
    <div className="flex h-40 items-end gap-1.5">
      {points.map((p) => {
        const v = Number(p[valueKey] || 0)
        const h = Math.max(4, Math.round((v / max) * 100))
        return (
          <div key={p.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-sky-600/80"
              style={{ height: `${h}%` }}
              title={`${p.date}: ${v}`}
            />
            <span className="truncate text-[9px] text-slate-400">
              {p.date.slice(5)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function AdminBhOverviewPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'bh', 'overview'],
    queryFn: () => adminBhService.overview(),
  })

  const analytics = (data?.analytics ?? null) as AnalyticsShape | null
  const campaignSummary = data?.campaignStats?.summary
  const campaignRows = data?.campaignStats?.rows ?? []

  const pageViews7d = useMemo(() => {
    if (!analytics?.daily?.length) return null
    return analytics.daily.reduce((s, d) => s + Number(d.pageViews || 0), 0)
  }, [analytics])

  const weekSums = useMemo(() => {
    const daily = analytics?.daily ?? []
    return {
      demos: daily.reduce((s, d) => s + Number(d.demoRequests || 0), 0),
      views: daily.reduce((s, d) => s + Number(d.pageViews || 0), 0),
      payments: daily.reduce((s, d) => s + Number(d.payments || 0), 0),
      revenue: daily.reduce((s, d) => s + Number(d.revenue || 0), 0),
    }
  }, [analytics])

  const topCampaigns = useMemo(() => {
    return [...campaignRows]
      .sort((a, b) => Number(b.usageCount || 0) - Number(a.usageCount || 0))
      .slice(0, 5)
  }, [campaignRows])

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader
        title="Bilirkişi Hesap — Genel Bakış"
        description="Özet, trend ve kampanya kullanımı."
        actions={
          <div className="flex gap-2">
            <Link to="/admin/bh/kampanyalar">
              <Button variant="secondary" size="sm">
                Kampanyalar
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => void refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        }
      />

      {isLoading ? <LoadingState /> : null}
      {isError ? (
        <EmptyState title="Özet yüklenemedi" description={getErrorMessage(error)} />
      ) : null}

      {data && !analytics && data.upstreamErrors?.analytics ? (
        <EmptyState
          title="Analitik alınamadı"
          description={data.upstreamErrors.analytics}
        />
      ) : null}

      {analytics ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Bugün görüntüleme"
              value={num(analytics.today?.pageViews)}
              hint={pctChange(
                Number(analytics.today?.pageViews || 0),
                Number(analytics.yesterday?.pageViews || 0),
              )}
              icon={Eye}
            />
            <Metric
              label="7 gün görüntüleme"
              value={num(pageViews7d)}
              icon={TrendingUp}
            />
            <Metric
              label="Bugün demo"
              value={num(analytics.today?.demoRequests)}
              icon={FileText}
            />
            <Metric
              label="Toplam demo"
              value={num(analytics.total?.demoRequests)}
              icon={FileText}
            />
            <Metric
              label="Toplam ödeme"
              value={num(analytics.total?.payments)}
              hint={
                analytics.today?.payments != null
                  ? `Bugün: ${num(analytics.today.payments)}`
                  : undefined
              }
              icon={ShoppingCart}
            />
            <Metric
              label="Toplam gelir"
              value={formatBhKurus(analytics.total?.revenue)}
              hint={
                analytics.today?.revenue != null
                  ? `Bugün: ${formatBhKurus(analytics.today.revenue)}`
                  : undefined
              }
              icon={DollarSign}
            />
            <Metric
              label="Aktif kampanya"
              value={
                campaignSummary?.activeCount != null
                  ? String(campaignSummary.activeCount)
                  : '—'
              }
              hint={
                campaignSummary?.totalUsage != null
                  ? `Toplam kullanım: ${num(campaignSummary.totalUsage)}`
                  : undefined
              }
              icon={Activity}
            />
            <Metric
              label="Son 5 dk aktif"
              value={num(analytics.activeLast5Min)}
              hint={
                analytics.activeLast5MinNote ||
                'Benzersiz ziyaretçi IP (son 5 dk)'
              }
              icon={Radio}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-7">
              <CardBody className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">Son 7 gün demo trendi</h2>
                {analytics.daily?.length ? (
                  <MiniBarChart points={analytics.daily} valueKey="demoRequests" />
                ) : (
                  <EmptyState title="Trend yok" description="Günlük demo verisi yok." />
                )}
              </CardBody>
            </Card>

            <Card className="lg:col-span-5">
              <CardBody className="space-y-2">
                <h2 className="text-sm font-semibold text-slate-900">7 günlük özet</h2>
                <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">Demo</span>
                  <span className="font-semibold tabular-nums">{num(weekSums.demos)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">Görüntüleme</span>
                  <span className="font-semibold tabular-nums">{num(weekSums.views)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">Ödeme</span>
                  <span className="font-semibold tabular-nums">{num(weekSums.payments)}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  <span className="text-slate-600">Gelir</span>
                  <span className="font-semibold tabular-nums">
                    {formatBhKurus(weekSums.revenue)}
                  </span>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-slate-900">Kampanya / kullanım</h2>
                <Link to="/admin/bh/kampanyalar" className="text-sm text-sky-700 hover:underline">
                  Yönet
                </Link>
              </div>
              {!topCampaigns.length ? (
                <EmptyState title="Kampanya yok" description="Aktif kullanım verisi yok." />
              ) : (
                <div className="space-y-2">
                  {topCampaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-100 px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">
                          {c.isActive ? 'Aktif' : 'Pasif'}
                          {c.usageLimit != null ? ` · limit ${c.usageLimit}` : ''}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums text-slate-900">
                        {num(c.usageCount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Dönüşüm oranı API’de ayrı alan olarak yok; kampanya kullanım sayıları gösterilir.
              </p>
            </CardBody>
          </Card>
        </>
      ) : null}
    </div>
  )
}
