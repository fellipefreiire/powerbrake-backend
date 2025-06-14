import sanitizeHtml from 'sanitize-html'

export function sanitize(input: string) {
  const sanitized = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  })

  return sanitized
}
