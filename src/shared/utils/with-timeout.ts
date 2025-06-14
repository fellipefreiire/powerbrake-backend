export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_resolve, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms),
    ),
  ])
}
