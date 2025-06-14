import { circuitBreaker, handleAll, ConsecutiveBreaker } from 'cockatiel'

export function createCircuitBreaker(
  name: string,
  logger: { warn: (msg: string) => void },
) {
  const breaker = circuitBreaker(handleAll, {
    halfOpenAfter: 10_000,
    breaker: new ConsecutiveBreaker(3),
  })

  breaker.onBreak(() => logger.warn(`[CB] ${name} opened (tripped)`))
  breaker.onHalfOpen(() => logger.warn(`[CB] ${name} half-open (testing)`))
  breaker.onReset(() => logger.warn(`[CB] ${name} closed (healthy)`))

  return breaker
}
