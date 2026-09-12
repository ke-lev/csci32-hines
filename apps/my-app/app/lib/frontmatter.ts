export type Frontmatter = {
  body: string
  data: Record<string, string>
}

// content files in this app put a small key: value block above the markdown body.
// values are always single-line strings; anything richer belongs in the body.
export function parseFrontmatter(source: string): Frontmatter | undefined {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)

  if (!match) {
    return undefined
  }

  const data = Object.fromEntries(
    match[1]
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        const separator = line.indexOf(':')
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
      }),
  )

  return { body: match[2].trim(), data }
}
