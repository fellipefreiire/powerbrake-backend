import type { User } from '@/domain/user/enterprise/entities/user'

export class UserPresenter {
  static toHTTP(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      addresses: user.addresses.getItems().map((address) => ({
        id: address.id.toString(),
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        complement: address.complement,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      })),
    }
  }
}
