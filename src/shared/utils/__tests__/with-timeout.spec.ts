import { describe, expect, it } from 'vitest'
import { withTimeout } from '../with-timeout'

describe('withTimeout', () => {
  it('should resolve if the promise finishes before timeout', async () => {
    const result = await withTimeout(
      new Promise((resolve) => setTimeout(() => resolve('ok'), 50)),
      100,
    )

    expect(result).toBe('ok')
  })

  it('should reject if the promise takes longer than the timeout', async () => {
    await expect(
      withTimeout(
        new Promise((resolve) => setTimeout(() => resolve('too late'), 150)),
        50,
      ),
    ).rejects.toThrowError('Timeout')
  })
})
