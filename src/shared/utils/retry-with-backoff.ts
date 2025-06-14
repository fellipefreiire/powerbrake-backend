/**
 * retryWithBackoff - Executa uma função assíncrona com tentativas automáticas e backoff exponencial.
 *
 * @param fn        Função que retorna uma Promise<T> (ex: chamada HTTP, email, storage)
 * @param options   retries: número de tentativas
 *                  initialDelayMs: delay inicial (em ms)
 *                  factor: fator de multiplicação do delay (default 2)
 *                  onRetry: callback a cada tentativa falha
 * @returns         Resultado da Promise, ou lança erro após esgotar tentativas
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options?: {
    retries?: number
    initialDelayMs?: number
    factor?: number
    onRetry?: (err: unknown, attempt: number) => void
  },
): Promise<T> {
  const retries = options?.retries ?? 3
  const factor = options?.factor ?? 2
  let delay = options?.initialDelayMs ?? 300
  let attempt = 0

  while (attempt < retries) {
    try {
      return await fn()
    } catch (err) {
      attempt++
      if (attempt >= retries) throw err
      if (options?.onRetry) options.onRetry(err, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay *= factor
    }
  }
  throw new Error('retryWithBackoff: unexpected exit')
}
