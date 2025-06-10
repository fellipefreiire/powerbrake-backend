import { UserAvatarWatcher } from '../user-avatar-watcher'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

describe('UserAvatarWatcher', () => {
  it('should return false if avatar has not changed', () => {
    const avatarId = new UniqueEntityID('avatar-1')
    const watcher = new UserAvatarWatcher(avatarId)

    watcher.update(new UniqueEntityID('avatar-1'))

    expect(watcher.hasChanged()).toBe(false)
  })

  it('should return true if avatar has changed', () => {
    const watcher = new UserAvatarWatcher(new UniqueEntityID('avatar-1'))

    watcher.update(new UniqueEntityID('avatar-2'))

    expect(watcher.hasChanged()).toBe(true)
  })

  it('should return true if avatar was removed', () => {
    const watcher = new UserAvatarWatcher(new UniqueEntityID('avatar-1'))

    watcher.update(null)

    expect(watcher.hasChanged()).toBe(true)
  })

  it('should return true if avatar was added', () => {
    const watcher = new UserAvatarWatcher(null)

    watcher.update(new UniqueEntityID('avatar-2'))

    expect(watcher.hasChanged()).toBe(true)
  })

  it('should return the updated avatar id', () => {
    const watcher = new UserAvatarWatcher(null)
    const newId = new UniqueEntityID('avatar-999')

    watcher.update(newId)

    expect(watcher.getUpdatedId()).toEqual(newId)
  })
})
