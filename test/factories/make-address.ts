import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Address } from '@/shared/address/enterprise/address'

export function makeAddress(overrides: Partial<Address> = {}): Address {
  return Address.create({
    street: 'Rua A',
    number: '123',
    neighborhood: 'Bairro A',
    complement: null,
    city: 'Cidade A',
    state: 'Estado A',
    zipCode: '00000-000',
    userId: new UniqueEntityID('user-1'),
    ...overrides,
  })
}
