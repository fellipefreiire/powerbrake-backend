import { retryWithBackoff } from '../retry-with-backoff'

describe('retryWithBackoff', () => {
  it('should resolve successfully on first attempt', async () => {
    const fn = vi.fn().mockResolvedValue('success')

    const result = await retryWithBackoff(fn)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should retry on failure and eventually succeed', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success')

    const onRetry = vi.fn()

    const result = await retryWithBackoff(fn, {
      retries: 3,
      initialDelayMs: 10,
      onRetry,
    })

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1)
  })

  it('should throw if all retries fail', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    const onRetry = vi.fn()

    await expect(
      retryWithBackoff(fn, { retries: 2, initialDelayMs: 10, onRetry }),
    ).rejects.toThrow('fail')

    expect(fn).toHaveBeenCalledTimes(2)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should use default values when options are not provided', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok')

    const result = await retryWithBackoff(fn)

    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })
})
