import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export class UserAvatarWatcher {
  private current: UniqueEntityID | null
  private updated: UniqueEntityID | null

  constructor(current: UniqueEntityID | null) {
    this.current = current
    this.updated = current
  }

  update(newAvatarId: UniqueEntityID | null): void {
    this.updated = newAvatarId
  }

  hasChanged(): boolean {
    return this.current?.toString() !== this.updated?.toString()
  }

  getUpdatedId(): UniqueEntityID | null {
    return this.updated
  }
}
