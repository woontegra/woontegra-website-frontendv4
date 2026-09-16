export function sanitizeTurkishTaxNumberInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

/** Empty is invalid for corporate (caller decides required). Non-empty must be 10 digits. */
export function validateTurkishTaxNumber(value: string, required = false): string | null {
  const digits = sanitizeTurkishTaxNumberInput(value)
  if (!digits) return required ? 'Vergi numarası zorunludur.' : null
  if (digits.length !== 10) return 'Vergi numarası 10 haneli olmalıdır.'
  return null
}
