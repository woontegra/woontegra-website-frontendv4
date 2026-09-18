/**
 * Bilirkişi Hesap demo talep — meslek / uzmanlık kataloğu.
 * Keep in sync with:
 * BILIRKISI-HESAP/aktuerya-website/webapi.bilirkisihesap.com/src/constants/bhDemoRequestCatalog.js
 */

export const BH_DEMO_PROFESSION_GROUPS = [
  { code: 'LAWYER', label: 'Avukat' },
  { code: 'SMMM', label: 'SMMM' },
  { code: 'SWORN_FINANCIAL_ADVISOR', label: 'Yeminli Mali Müşavir' },
  { code: 'HR', label: 'İnsan Kaynakları' },
  { code: 'LEGAL_ENTITY', label: 'Tüzel Kişi' },
  { code: 'OTHER', label: 'Diğer' },
] as const

export type BhDemoProfessionGroupCode = (typeof BH_DEMO_PROFESSION_GROUPS)[number]['code']

export type BhDemoExpertiseArea = {
  code: string
  name: string
  /** Compact admin / chip label */
  shortName: string
}

export const BH_DEMO_EXPERTISE_AREAS: readonly BhDemoExpertiseArea[] = [
  {
    code: '60.01',
    name: 'AKTÜERYA (İŞ GÖREMEZLİK/DESTEKTEN YOKSUN KALMA)',
    shortName: 'Aktüerya',
  },
  {
    code: '60.02',
    name: 'İŞ MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'İş Mevzuatı',
  },
  {
    code: '60.03',
    name: 'SOSYAL GÜVENLİK MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Sosyal Güvenlik',
  },
  {
    code: '60.04',
    name: 'SENDİKALAR VE TOPLU İŞ SÖZLEŞMESİ MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Sendika / TİS',
  },
  {
    code: '60.05',
    name: 'İCRA VE İFLAS MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'İcra ve İflas',
  },
  {
    code: '60.06',
    name: 'AİLE MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Aile Mevzuatı',
  },
  {
    code: '60.07',
    name: 'KOOPERATİFLER MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Kooperatifler',
  },
  {
    code: '60.08',
    name: 'KAT MÜLKİYETİ MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Kat Mülkiyeti',
  },
  {
    code: '60.09',
    name: 'TÜKETİCİ MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Tüketici',
  },
  {
    code: '60.10',
    name: 'BORÇLAR MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Borçlar',
  },
  {
    code: '60.11',
    name: 'TİCARET MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Ticaret',
  },
  {
    code: '60.12',
    name: 'BANKACILIK MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Bankacılık',
  },
  {
    code: '60.13',
    name: 'AVUKATLIK MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Avukatlık',
  },
  {
    code: '60.14',
    name: 'KAMU İHALE MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Kamu İhale',
  },
  {
    code: '60.15',
    name: 'FERAİZ HESAPLAMALARI',
    shortName: 'Feraiz',
  },
  {
    code: '60.16',
    name: 'ASKERİ MEVZUATTAN (2629, 3269, 4678, 926, 6245, 205 S.K. İLE 375 SAYILI KHK) KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Askeri Mevzuat',
  },
  {
    code: '60.17',
    name: 'ASKERİ HİZMET SIRASINDA MEYDANA GELEN KAZA VE OLAYLARDAN DOĞAN ZARARLARDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Askeri Kaza/Olay',
  },
  {
    code: '60.18',
    name: 'ASKERİ BİRİMLERDE İŞLENEN GÖREV SUÇLARINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Askeri Görev Suçu',
  },
  {
    code: '60.19',
    name: 'MİRAS MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Miras',
  },
  {
    code: '60.20',
    name: 'KİRA MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Kira',
  },
  {
    code: '60.21',
    name: 'SPOR MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Spor',
  },
  {
    code: '60.22',
    name: 'ESER SÖZLEŞMELERİNDEN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Eser Sözleşmesi',
  },
  {
    code: '60.23',
    name: 'KAT KARŞILIĞI (ARSA PAYI KARŞILIĞI) İNŞAAT SÖZLEŞMELERİNDEN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Kat Karşılığı İnşaat',
  },
  {
    code: '60.24',
    name: 'SAĞLIK MEVZUATINDAN KAYNAKLI NİTELİKLİ HESAPLAMALAR',
    shortName: 'Sağlık',
  },
] as const

const professionByCode = new Map(BH_DEMO_PROFESSION_GROUPS.map((p) => [p.code, p]))
const expertiseByCode = new Map(BH_DEMO_EXPERTISE_AREAS.map((e) => [e.code, e]))

export function getProfessionGroupLabel(code: string | null | undefined): string {
  if (!code) return '—'
  return professionByCode.get(code as BhDemoProfessionGroupCode)?.label ?? code
}

export function resolveExpertiseAreas(
  areas: Array<{ code?: string; name?: string }> | null | undefined,
): BhDemoExpertiseArea[] {
  if (!Array.isArray(areas) || !areas.length) return []
  const out: BhDemoExpertiseArea[] = []
  for (const item of areas) {
    const code = String(item?.code || '').trim()
    if (!code) continue
    const catalog = expertiseByCode.get(code)
    if (catalog) {
      out.push(catalog)
      continue
    }
    out.push({
      code,
      name: String(item?.name || code).trim() || code,
      shortName: String(item?.name || code).trim() || code,
    })
  }
  return out
}

export function formatExpertiseAreasCompact(
  areas: Array<{ code?: string; name?: string }> | null | undefined,
): string {
  const resolved = resolveExpertiseAreas(areas)
  if (!resolved.length) return '—'
  const first = `${resolved[0].code} ${resolved[0].shortName}`
  const extra = resolved.length - 1
  return extra > 0 ? `${first} +${extra}` : first
}

export function isValidProfessionGroupCode(code: unknown): code is BhDemoProfessionGroupCode {
  return typeof code === 'string' && professionByCode.has(code as BhDemoProfessionGroupCode)
}

export function normalizeExpertiseSelection(codes: string[]): Array<{ code: string; name: string }> {
  const unique = [...new Set(codes.map((c) => String(c || '').trim()).filter(Boolean))]
  const out: Array<{ code: string; name: string }> = []
  for (const code of unique) {
    const hit = expertiseByCode.get(code)
    if (!hit) continue
    out.push({ code: hit.code, name: hit.name })
  }
  return out
}
