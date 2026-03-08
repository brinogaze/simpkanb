const TAG_COLOR_PREFIX = '::'

export interface ParsedTag {
  label: string
  color: string | null
}

export function parseTag(raw: string): ParsedTag {
  const idx = raw.lastIndexOf(TAG_COLOR_PREFIX)
  if (idx <= 0) return { label: raw, color: null }
  const label = raw.slice(0, idx)
  const color = raw.slice(idx + TAG_COLOR_PREFIX.length)
  if (!label) return { label: raw, color: null }
  if (!/^#([0-9a-fA-F]{6})$/.test(color)) return { label: raw, color: null }
  return { label, color }
}

export function encodeTag(label: string, color: string | null): string {
  return color ? `${label}${TAG_COLOR_PREFIX}${color}` : label
}
