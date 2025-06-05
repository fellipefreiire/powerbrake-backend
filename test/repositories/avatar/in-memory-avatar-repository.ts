import { AvatarRepository } from '@/shared/avatar/application/repositories/avatar-repository'
import { Avatar } from '@/shared/avatar/enterprise/entities/avatar'

export class InMemoryAvatarRepository implements AvatarRepository {
  public items: Avatar[] = []

  async create(avatar: Avatar): Promise<void> {
    this.items.push(avatar)
  }

  async findById(id: string): Promise<Avatar | null> {
    const avatar = this.items.find((item) => item.id.toString() === id)
    return avatar || null
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === id)

    if (index > -1) {
      this.items.splice(index, 1)
    }
  }

  async list(): Promise<Avatar[]> {
    return this.items
  }
}
