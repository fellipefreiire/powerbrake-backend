type ExecuteFn<T> = () => Promise<T> | T

export class FakeCircuitBreaker {
  private shouldFail = false
  private failWithError: unknown = new Error('Circuit open')
  private calls: number = 0

  setOpen(error?: unknown) {
    this.shouldFail = true
    if (error) this.failWithError = error
  }

  reset() {
    this.shouldFail = false
    this.failWithError = new Error('Circuit open')
  }

  getCalls() {
    return this.calls
  }

  async execute<T>(fn: ExecuteFn<T>): Promise<T> {
    this.calls++
    if (this.shouldFail) {
      throw this.failWithError
    }
    return await fn()
  }
}
