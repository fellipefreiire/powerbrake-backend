export abstract class UserAvatarRepository {
  abstract attachAvatarToUser(userId: string, avatarId: string): Promise<void>
}
