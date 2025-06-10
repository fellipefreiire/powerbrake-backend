import { Address } from '@/shared/address/enterprise/address'

export class UserAddressWatcher {
  private current: Address[]
  private updated: Address[]

  constructor(current: Address[]) {
    this.current = current
    this.updated = [...current]
  }

  update(newAddresses: Address[]) {
    this.updated = [...newAddresses]
  }

  hasChanged(): boolean {
    if (this.current.length !== this.updated.length) return true

    return this.current.some((curr, i) => {
      const next = this.updated[i]
      return (
        curr.street !== next.street ||
        curr.number !== next.number ||
        curr.complement !== next.complement ||
        curr.neighborhood !== next.neighborhood ||
        curr.city !== next.city ||
        curr.state !== next.state ||
        curr.zipCode !== next.zipCode
      )
    })
  }

  getUpdatedAddresses(): Address[] {
    return this.updated
  }
}
