import { UserAddressWatcher } from '../user-address-watcher'
import { makeAddress } from 'test/factories/make-address'

describe('UserAddressWatcher', () => {
  it('should return false if addresses are identical', () => {
    const base = makeAddress()

    const watcher = new UserAddressWatcher([base])
    watcher.update([
      makeAddress({
        street: base.street,
        number: base.number,
        complement: base.complement,
        neighborhood: base.neighborhood,
        city: base.city,
        state: base.state,
        zipCode: base.zipCode,
      }),
    ])

    expect(watcher.hasChanged()).toBe(false)
    expect(watcher.getUpdatedAddresses()).toHaveLength(1)
  })

  it('should return true if any field was changed', () => {
    const base = makeAddress()

    const changed = makeAddress({
      street: 'New Street',
      number: base.number,
      complement: base.complement,
      neighborhood: base.neighborhood,
      city: base.city,
      state: base.state,
      zipCode: base.zipCode,
    })

    const watcher = new UserAddressWatcher([base])
    watcher.update([changed])

    expect(watcher.hasChanged()).toBe(true)
  })

  it('should return true if a new address was added', () => {
    const base = makeAddress()

    const watcher = new UserAddressWatcher([base])
    watcher.update([base, makeAddress()])

    expect(watcher.hasChanged()).toBe(true)
  })

  it('should return true if an address was removed', () => {
    const a1 = makeAddress()
    const a2 = makeAddress()

    const watcher = new UserAddressWatcher([a1, a2])
    watcher.update([a1])

    expect(watcher.hasChanged()).toBe(true)
  })

  it('should correctly return updated addresses', () => {
    const a1 = makeAddress()
    const a2 = makeAddress()

    const watcher = new UserAddressWatcher([a1])
    watcher.update([a1, a2])

    const updated = watcher.getUpdatedAddresses()

    expect(updated).toHaveLength(2)
    expect(updated).toEqual(expect.arrayContaining([a1, a2]))
  })
})
