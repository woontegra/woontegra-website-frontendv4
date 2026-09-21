import { describe, expect, it } from 'vitest'
import {
  Award,
  CheckCircle,
  Cloud,
  Code2,
  Lightbulb,
  Palette,
  Scale,
  ShoppingCart,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { resolveBuilderCardIcon } from '@/builder/render/BuilderCardIcon'
import { resolveIcon, tryResolveIcon } from './iconRegistry'

describe('iconRegistry homepage card identifiers', () => {
  it('resolves live home services kebab/short names', () => {
    expect(resolveBuilderCardIcon('code')).toBe(Code2)
    expect(resolveBuilderCardIcon('palette')).toBe(Palette)
    expect(resolveBuilderCardIcon('shopping-cart')).toBe(ShoppingCart)
    expect(resolveBuilderCardIcon('cloud')).toBe(Cloud)
    expect(resolveBuilderCardIcon('scale')).toBe(Scale)
    expect(resolveBuilderCardIcon('lightbulb')).toBe(Lightbulb)
  })

  it('resolves why-section identifiers used on the homepage', () => {
    expect(resolveBuilderCardIcon('award')).toBe(Award)
    expect(resolveBuilderCardIcon('target')).toBe(Target)
    expect(resolveBuilderCardIcon('zap')).toBe(Zap)
    expect(resolveBuilderCardIcon('trending-up')).toBe(TrendingUp)
    expect(resolveBuilderCardIcon('check-circle')).toBe(CheckCircle)
  })

  it('resolves homepage intro step identifiers to design-system icons', () => {
    expect(resolveBuilderCardIcon('01')).toBe(Target)
    expect(resolveBuilderCardIcon('02')).toBe(Code2)
    expect(resolveBuilderCardIcon('03')).toBe(tryResolveIcon('Settings'))
  })

  it('keeps unknown builder icons null so raw strings are not rendered', () => {
    expect(tryResolveIcon('not-a-real-icon')).toBeNull()
    expect(resolveBuilderCardIcon('not-a-real-icon')).toBeNull()
    expect(resolveIcon('missing')).toBeTruthy()
  })
})
