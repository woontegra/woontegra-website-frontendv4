import type { BlockBase, BlockStyle, BlockVisibility } from './common'
import {
  MK_COMPARE_DESKTOP_COLUMN,
  MK_COMPARE_TABLE_DESCRIPTION,
  MK_COMPARE_TABLE_ROWS,
  MK_COMPARE_TABLE_TITLE,
  MK_COMPARE_WEB_COLUMN,
} from '@/components/public/muvekkil-kasa/mkCompareContent'

export type MkCompareCellTone = 'check' | 'neutral' | 'saas' | 'info'

export type MkCompareValueKey =
  | 'desktop-license'
  | 'desktop-devices'
  | 'desktop-price'
  | 'saas-years'
  | 'saas-price'

export type MkCompareTableCell = {
  tone: MkCompareCellTone
  text: string
  hint?: string
  valueKey?: MkCompareValueKey
}

export type MkCompareTableRow = {
  id: string
  feature: string
  desktop: MkCompareTableCell
  saas: MkCompareTableCell
}

export type MkCompareTableBlock = BlockBase & {
  type: 'mk-compare-table'
  settings: {
    anchorId: string
    desktopColumnLabel: string
    saasColumnLabel: string
    rows: MkCompareTableRow[]
  }
}

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7)}`
}

function baseStyle(): BlockStyle {
  return {
    containerWidth: 'wide',
    contentAlign: 'left',
    paddingTop: { desktop: '64px', mobile: '48px' },
    paddingBottom: { desktop: '64px', mobile: '48px' },
  }
}

function baseVisibility(): BlockVisibility {
  return {
    enabled: true,
    showTitle: true,
    showDescription: true,
    showImage: false,
    showButton: false,
  }
}

function cell(tone: MkCompareCellTone, text: string, extra?: Partial<MkCompareTableCell>): MkCompareTableCell {
  return { tone, text, ...extra }
}

export function createDefaultMkCompareTableRows(): MkCompareTableRow[] {
  return MK_COMPARE_TABLE_ROWS.map((row) => ({
    id: row.id,
    feature: row.feature,
    desktop: cell(row.desktop.tone, row.desktop.text, row.desktop.hint ? { hint: row.desktop.hint } : undefined),
    saas: cell(row.saas.tone, row.saas.text, row.saas.hint ? { hint: row.saas.hint } : undefined),
  }))
}

export function createDefaultMkCompareTableBlock(sortOrder: number): MkCompareTableBlock {
  return {
    id: uid('mk-compare-table'),
    type: 'mk-compare-table',
    sortOrder,
    title: MK_COMPARE_TABLE_TITLE,
    description: MK_COMPARE_TABLE_DESCRIPTION,
    visibility: baseVisibility(),
    style: baseStyle(),
    settings: {
      anchorId: 'surum-karsilastirmasi',
      desktopColumnLabel: MK_COMPARE_DESKTOP_COLUMN,
      saasColumnLabel: MK_COMPARE_WEB_COLUMN,
      rows: createDefaultMkCompareTableRows(),
    },
  }
}
