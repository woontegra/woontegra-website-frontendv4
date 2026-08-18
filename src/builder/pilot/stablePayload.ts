export function stableStringify(value: unknown): string {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys)
  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(row)
        .sort()
        .map((key) => [key, sortKeys(row[key])]),
    )
  }
  return value
}

export function payloadsDiffer(a: unknown, b: unknown): boolean {
  return stableStringify(a) !== stableStringify(b)
}
