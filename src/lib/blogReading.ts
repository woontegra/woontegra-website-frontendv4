function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function estimateReadingTimeMinutes(content: string): number {
  const text = stripHtml(content)
  if (!text) return 1
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} dk okuma`
}
