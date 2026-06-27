export type BankTransferDisplay = {
  bankTransferEnabled: boolean
  configured: boolean
  bankName?: string
  branchName?: string
  accountNumber?: string
  accountHolder?: string
  iban?: string
  currency?: string
  referenceNote?: string
}

export type PaytrStartResponse = {
  iframe_token: string
}
