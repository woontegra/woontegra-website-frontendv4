import { KoopPlusProductLayout, type KoopPlusProductLayoutProps } from '@/components/public/koopplus/KoopPlusProductLayout'

export type KoopPlusProductViewProps = KoopPlusProductLayoutProps

export function KoopPlusProductView(props: KoopPlusProductViewProps) {
  return <KoopPlusProductLayout {...props} />
}
