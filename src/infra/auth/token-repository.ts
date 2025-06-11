export abstract class TokenRepository {
  abstract generateAccessToken(payload: {
    sub: string
    role: string
  }): Promise<{
    token: string
    expiresIn: number
  }>

  abstract generateRefreshToken(payload: {
    sub: string
    role: string
    jti: string
  }): Promise<{
    token: string
    expiresIn: number
  }>
}
