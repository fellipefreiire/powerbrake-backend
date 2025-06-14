import { sanitize } from '../sanitize-html'

describe('sanitize', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script><b>bold</b>'
    const result = sanitize(input)

    expect(result).toBe('bold')
  })

  it('should preserve plain text', () => {
    const input = 'hello world'
    const result = sanitize(input)

    expect(result).toBe('hello world')
  })

  it('should strip attributes and tags', () => {
    const input = '<a href="https://example.com">link</a>'
    const result = sanitize(input)

    expect(result).toBe('link')
  })

  it('should return empty string if only HTML tags are passed', () => {
    const input = '<div><img src="x"/></div>'
    const result = sanitize(input)

    expect(result).toBe('')
  })
})
