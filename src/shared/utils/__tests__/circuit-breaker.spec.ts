import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrokenCircuitError } from 'cockatiel'
import { createCircuitBreaker } from '../circuit-breaker'
import { FakeLogger } from 'test/infra/fake-logger'

const alwaysFail = vi.fn().mockRejectedValue(new Error('external fail'))

describe('createCircuitBreaker', () => {
  let breaker: ReturnType<typeof createCircuitBreaker>
  let fakeLogger: FakeLogger

  beforeEach(() => {
    fakeLogger = new FakeLogger()
    breaker = createCircuitBreaker('test-breaker', fakeLogger)
    alwaysFail.mockClear()
    fakeLogger.clear()
  })

  it('should execute normally before the failure threshold', async () => {
    await expect(breaker.execute(() => Promise.resolve('ok'))).resolves.toBe(
      'ok',
    )
    await expect(breaker.execute(() => Promise.resolve('ok2'))).resolves.toBe(
      'ok2',
    )
    expect(fakeLogger.warnings.length).toBe(0)
    expect(fakeLogger.errors.length).toBe(0)
  })

  it('should open the breaker after reaching the failure threshold', async () => {
    await expect(breaker.execute(alwaysFail)).rejects.toThrow('external fail')
    await expect(breaker.execute(alwaysFail)).rejects.toThrow('external fail')
    await expect(breaker.execute(alwaysFail)).rejects.toThrow('external fail')

    await expect(breaker.execute(alwaysFail)).rejects.toThrow(
      BrokenCircuitError,
    )
    expect(fakeLogger.warnings.some((msg) => msg.includes('opened'))).toBe(true)
  })

  it('should reset after halfOpenAfter time', async () => {
    vi.useFakeTimers()

    await expect(breaker.execute(alwaysFail)).rejects.toThrow('external fail')
    await expect(breaker.execute(alwaysFail)).rejects.toThrow('external fail')
    await expect(breaker.execute(alwaysFail)).rejects.toThrow('external fail')
    await expect(breaker.execute(alwaysFail)).rejects.toThrow(
      BrokenCircuitError,
    )

    vi.advanceTimersByTime(10_000)

    await expect(breaker.execute(alwaysFail)).rejects.toThrow('external fail')
    await expect(breaker.execute(alwaysFail)).rejects.toThrow(
      BrokenCircuitError,
    )

    const alwaysOk = vi.fn().mockResolvedValue('ok')
    vi.advanceTimersByTime(10_000)
    await expect(breaker.execute(alwaysOk)).resolves.toBe('ok')
    await expect(breaker.execute(alwaysOk)).resolves.toBe('ok')

    expect(fakeLogger.warnings.some((msg) => msg.includes('closed'))).toBe(true)

    vi.useRealTimers()
  })
})
