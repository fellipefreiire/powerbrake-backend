export abstract class TokenVerifier {
  abstract verify<T extends object = Record<string, unknown>>(token: string): T
}
