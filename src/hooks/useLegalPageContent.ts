import { useEffect, useState } from 'react'
import { pageContentService } from '@/services/pageContentService'
import { mergeLegalPageContent, type LegalPageContent } from '@/types/legalPageContent'

export function useLegalPageContent(pageKey: string, defaults: LegalPageContent): LegalPageContent {
  const [content, setContent] = useState<LegalPageContent>(() => mergeLegalPageContent(defaults))

  useEffect(() => {
    void pageContentService.getRawByKey(pageKey).then((raw) => {
      setContent(mergeLegalPageContent(defaults, raw as Partial<LegalPageContent> | null))
    })
  }, [pageKey, defaults])

  return content
}
