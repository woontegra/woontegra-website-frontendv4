import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Cloud,
  CreditCard,
  Eye,
  MoreHorizontal,
  Pencil,
  ShoppingBag,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { getErrorMessage } from '@/api/client'
import { adminCustomersService } from '@/services/adminCustomersService'
import type { AdminCustomerListItem } from '@/types/adminCustomer'
import { cn } from '@/lib/cn'

type Props = {
  row: AdminCustomerListItem
  onActionMessage?: (message: string | null) => void
  onActionError?: (message: string | null) => void
}

export function AdminCustomerRowActions({ row, onActionMessage, onActionError }: Props) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'customers'] }),
      queryClient.invalidateQueries({ queryKey: ['admin', 'customer', row.id] }),
    ])
  }

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => adminCustomersService.patchStatus(row.id, isActive),
    onSuccess: async () => {
      onActionMessage?.(row.isActive ? 'Müşteri pasife alındı.' : 'Müşteri aktif edildi.')
      onActionError?.(null)
      setStatusOpen(false)
      setOpen(false)
      await invalidate()
    },
    onError: (err) => {
      onActionError?.(getErrorMessage(err, 'Durum güncellenemedi'))
      onActionMessage?.(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => adminCustomersService.delete(row.id),
    onSuccess: async () => {
      onActionMessage?.('Müşteri kalıcı olarak silindi.')
      onActionError?.(null)
      setDeleteOpen(false)
      setOpen(false)
      await invalidate()
    },
    onError: (err) => {
      onActionError?.(getErrorMessage(err, 'Müşteri silinemedi'))
      onActionMessage?.(null)
    },
  })

  const ordersHref = `/admin/orders?customerQuery=${encodeURIComponent(row.email)}`
  const paymentsHref = `/admin/payments?customerQuery=${encodeURIComponent(row.email)}`
  const saasCreateHref = `/admin/saas-subscriptions/new?customerId=${encodeURIComponent(row.id)}&customerEmail=${encodeURIComponent(row.email)}`

  const menuItemClass =
    'flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50'

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        size="sm"
        className="h-8 px-2"
        onClick={() => setOpen((v) => !v)}
        aria-label="İşlemler"
        title="İşlemler"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <Link to={`/admin/customers/${encodeURIComponent(row.id)}`} className={menuItemClass} onClick={() => setOpen(false)}>
            <Eye className="h-4 w-4 text-slate-500" />
            Detay
          </Link>
          <Link
            to={`/admin/customers/${encodeURIComponent(row.id)}/edit`}
            className={menuItemClass}
            onClick={() => setOpen(false)}
          >
            <Pencil className="h-4 w-4 text-slate-500" />
            Düzenle
          </Link>
          <Link to={ordersHref} className={menuItemClass} onClick={() => setOpen(false)}>
            <ShoppingBag className="h-4 w-4 text-slate-500" />
            Siparişleri Gör
          </Link>
          <Link to={paymentsHref} className={menuItemClass} onClick={() => setOpen(false)}>
            <CreditCard className="h-4 w-4 text-slate-500" />
            Ödemeleri Gör
          </Link>
          <Link to={saasCreateHref} className={menuItemClass} onClick={() => setOpen(false)}>
            <Cloud className="h-4 w-4 text-slate-500" />
            SaaS Aboneliği Oluştur
          </Link>
          <button
            type="button"
            className={menuItemClass}
            onClick={() => {
              setOpen(false)
              setStatusOpen(true)
            }}
          >
            {row.isActive ? (
              <>
                <UserX className="h-4 w-4 text-amber-600" />
                Pasife Al
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 text-emerald-600" />
                Aktif Et
              </>
            )}
          </button>

          {row.canDelete ? (
            <>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                className={cn(menuItemClass, 'text-red-700 hover:bg-red-50')}
                onClick={() => {
                  setOpen(false)
                  setDeleteOpen(true)
                }}
              >
                <Trash2 className="h-4 w-4" />
                Kalıcı Sil…
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={statusOpen}
        title={row.isActive ? 'Müşteriyi pasife al' : 'Müşteriyi aktif et'}
        description={
          row.isActive
            ? `${row.name} hesabı pasife alınır; giriş yapamaz. Sipariş ve abonelik kayıtları korunur.`
            : `${row.name} hesabı tekrar aktif edilir ve giriş yapabilir.`
        }
        confirmLabel={row.isActive ? 'Pasife al' : 'Aktif et'}
        loading={statusMutation.isPending}
        onCancel={() => setStatusOpen(false)}
        onConfirm={() => statusMutation.mutate(!row.isActive)}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Müşteriyi kalıcı sil"
        tone="danger"
        confirmLabel="Kalıcı sil"
        description={
          <div className="space-y-2">
            <p>
              <strong>{row.name}</strong> ({row.email}) kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
            <p className="text-xs text-slate-500">
              Yalnızca sipariş, ödeme, SaaS aboneliği ve lisans kaydı olmayan test müşterileri silinebilir.
            </p>
          </div>
        }
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
