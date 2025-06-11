export abstract class RefreshTokenRepository {
  abstract create(userId: string): Promise<string>
  abstract validate(jti: string): Promise<boolean>
  abstract revoke(jti: string): Promise<void>
  abstract revokeAllForUser(userId: string): Promise<void>
}
