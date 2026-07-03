import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, FileText, RefreshCw, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'
import { adminOrdersService } from '@/services/adminOrdersService'
import { getErrorMessage } from '@/api/client'
import { formatDateTime } from '@/utils/adminOrderUi'
import { LEGAL_TYPE_LABELS, type LegalDocType } from '@/types/legalDocuments'
import type { AdminOrderDetail } from '@/types/order'

/** Zorunlu / bilgilendirme / opsiyonel belge sınıflandırması (checkout kurallarıyla aynı). */
const REQUIRED_TYPES = new Set<string>([
  'PRE_INFORMATION',
  'DISTANCE_SALES',
  'SOFTWARE_LICENSE',
  'SAAS_SUBSCRIPTION',
  'DIGITAL_IMMEDIATE_DELIVERY_WAIVER',
])
const OPTIONAL_TYPES = new Set<string>(['COMMERCIAL_ELECTRONIC_MESSAGE', 'EXPLICIT_CONSENT'])

function docKind(documentType: string): 'required' | 'optional' | 'info' {
  if (REQUIRED_TYPES.has(documentType)) return 'required'
  if (OPTIONAL_TYPES.has(documentType)) return 'optional'
  return 'info'
}

function docLabel(documentType: string): string {
  return LEGAL_TYPE_LABELS[documentType as LegalDocType] ?? documentType
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : '—'
}

type Props = {
  order: AdminOrderDetail
  onToast: (message: string) => void
}

export function AdminLegalConsentsCard({ order, onToast }: Props) {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState<string | null>(null)
  const snapshots = order.legalSnapshots ?? []
  const archiveFiles = order.legalArchiveFiles ?? []
  const hasSnapshots = snapshots.length > 0

  const generateMutation = useMutation({
    mutationFn: (force: boolean) => adminOrdersService.generateLegalArchive(order.id, force),
    onSuccess: (_data, force) => {
      onToast(force ? 'Yasal arşiv yeniden oluşturuldu.' : 'Yasal arşiv (PDF) oluşturuldu.')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'orders', order.id] })
    },
    onError: (err) => setFormError(getErrorMessage(err, 'Yasal arşiv oluşturulamadı.')),
  })

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      await adminOrdersService.downloadLegalArchiveFile(order.id, fileId, fileName)
    } catch (err) {
      setFormError(getErrorMessage(err, 'Dosya indirilemedi.'))
    }
  }

  const handleGenerate = (force: boolean) => {
    setFormError(null)
    if (force && !window.confirm('Mevcut yasal arşiv dosyaları silinip yeniden oluşturulacak. Devam edilsin mi?')) {
      return
    }
    void generateMutation.mutateAsync(force)
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Yasal onaylar (ispat)</h2>
        </div>

        {formError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        ) : null}

        {!hasSnapshots ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
            Bu sipariş için yasal belge snapshot kaydı bulunmuyor. (Snapshot sistemi öncesinde oluşturulan eski
            siparişlerde bu kayıt bulunmayabilir.)
          </p>
        ) : (
          <>
            {/* Belge bazında ispat listesi */}
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <Table>
                <THead>
                  <TR>
                    <TH>Belge</TH>
                    <TH>Zorunlu</TH>
                    <TH>Onay</TH>
                    <TH>Onay tarihi</TH>
                    <TH>Sürüm</TH>
                    <TH>IP</TH>
                  </TR>
                </THead>
                <TBody>
                  {snapshots.map((s) => {
                    const kind = docKind(s.documentType)
                    return (
                      <TR key={s.id}>
                        <TD>
                          <p className="font-medium text-slate-900">{s.title || docLabel(s.documentType)}</p>
                          <p className="font-mono text-xs text-slate-400">{s.documentType}</p>
                        </TD>
                        <TD>
                          {kind === 'required' ? (
                            <Badge tone="warning">Zorunlu</Badge>
                          ) : kind === 'optional' ? (
                            <Badge tone="default">Opsiyonel</Badge>
                          ) : (
                            <Badge tone="brand">Bilgilendirme</Badge>
                          )}
                        </TD>
                        <TD>
                          <Badge tone="success">Onaylandı</Badge>
                        </TD>
                        <TD className="text-xs text-slate-600">{formatDateTime(s.acceptedAt)}</TD>
                        <TD className="text-xs text-slate-600">v{s.version}</TD>
                        <TD className="text-xs text-slate-600">{dash(s.ipAddress)}</TD>
                      </TR>
                    )
                  })}
                </TBody>
              </Table>
            </div>

            {/* Teknik ispat: IP / User-Agent / sepet tipleri / opsiyonel onaylar */}
            <dl className="grid gap-2 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Onay IP</dt>
                <dd className="break-all text-slate-800">{dash(order.acceptedIp)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Sepet ürün tipleri</dt>
                <dd className="text-slate-800">{dash(order.legalCartProductTypes)}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-slate-500">User-Agent</dt>
                <dd className="break-all text-slate-800">{dash(order.acceptedUserAgent)}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Ticari elektronik ileti izni</dt>
                <dd className="text-slate-800">
                  {order.marketingConsentAt ? `Onaylandı — ${formatDateTime(order.marketingConsentAt)}` : 'İşaretlenmedi'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Açık rıza metni</dt>
                <dd className="text-slate-800">
                  {order.explicitConsentAt ? `Onaylandı — ${formatDateTime(order.explicitConsentAt)}` : 'İşaretlenmedi'}
                </dd>
              </div>
            </dl>

            {/* Snapshot içerikleri (siparişe özel render) */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">Belge metin snapshot’ları</h3>
              <ul className="space-y-2">
                {snapshots.map((s) => (
                  <li key={`content-${s.id}`} className="rounded-lg border border-slate-100">
                    <details>
                      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50">
                        {s.title || docLabel(s.documentType)}{' '}
                        <span className="font-normal text-slate-500">(v{s.version})</span>
                      </summary>
                      <div
                        className="prose prose-slate max-w-none border-t border-slate-100 bg-white px-4 py-3 text-sm [&_.legal-buyer-block]:my-3 [&_.legal-buyer-block]:rounded-lg [&_.legal-buyer-block]:border [&_.legal-buyer-block]:border-slate-200 [&_.legal-buyer-block]:bg-slate-50 [&_.legal-buyer-block]:p-3"
                        dangerouslySetInnerHTML={{ __html: s.content }}
                      />
                    </details>
                  </li>
                ))}
              </ul>
            </div>

            {/* PDF arşivi */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">Yasal belge PDF’leri</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={generateMutation.isPending}
                    onClick={() => handleGenerate(false)}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    {generateMutation.isPending ? 'Oluşturuluyor…' : archiveFiles.length > 0 ? 'PDF paketini güncelle' : 'PDF paketini oluştur'}
                  </Button>
                  {archiveFiles.length > 0 ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={generateMutation.isPending}
                      onClick={() => handleGenerate(true)}
                    >
                      <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
                      Yeniden oluştur
                    </Button>
                  ) : null}
                </div>
              </div>

              {archiveFiles.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <Table>
                    <THead>
                      <TR>
                        <TH>Belge</TH>
                        <TH>Dosya</TH>
                        <TH>Oluşturulma</TH>
                        <TH> </TH>
                      </TR>
                    </THead>
                    <TBody>
                      {archiveFiles.map((f) => (
                        <TR key={f.id}>
                          <TD className="font-medium text-slate-900">{f.title}</TD>
                          <TD className="font-mono text-xs text-slate-600">{f.fileName}</TD>
                          <TD className="text-xs text-slate-600">{formatDateTime(f.generatedAt)}</TD>
                          <TD>
                            <button
                              type="button"
                              onClick={() => void handleDownload(f.id, f.fileName)}
                              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {f.fileCategory === 'acceptance_json' ? 'JSON' : 'PDF'} indir
                            </button>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Henüz PDF üretilmedi. Her belgenin PDF çıktısını almak için “PDF paketini oluştur” butonunu kullanın.
                </p>
              )}
            </div>
          </>
        )}
      </CardBody>
    </Card>
  )
}
