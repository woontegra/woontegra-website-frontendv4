export function PaytrIframe({ orderNo, token }: { orderNo: string; token: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Güvenli ödeme</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-900">PayTR ile ödeme</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sipariş no: <span className="font-mono font-semibold">{orderNo}</span>. Ödeme onayından sonra lisans ve
          teslimat bilgileri e-posta adresinize gönderilir.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <iframe
          title="PayTR Ödeme"
          src={`https://www.paytr.com/odeme/guvenli/${token}`}
          className="block min-h-[70dvh] w-full border-0 sm:min-h-[820px]"
          allow="payment *"
        />
      </div>
    </div>
  )
}
