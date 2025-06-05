import { AbilityBuilder } from '@casl/ability'
import { AppAbility } from './ability.factory'
import type { User } from './models/user'
import type { Role } from '@prisma/client'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(user, { can, cannot }) {
    can('manage', 'all')
    cannot('update', 'User')
    can('update', 'User', {
      sub: { $eq: user.sub },
    })
  },
  MANAGER(user, { can }) {
    can('read', 'User')
    can('list', 'User')
    can('create', 'User')
    can('activate', 'User')
    can('deactivate', 'User')
    can('update-role', 'User')
    can('update', 'User', {
      sub: { $eq: user.sub },
    })
    can('manage', 'Avatar')
  },
  SUPERVISOR(user, { can }) {
    can('read', 'User')
    can('list', 'User')
    can('update', 'User', {
      sub: { $eq: user.sub },
    })
    can('manage', 'Avatar')
  },
  OPERATOR(user, { can, cannot }) {
    cannot('read', 'User')
    cannot('list', 'User')
    can('read', 'User', {
      sub: { $eq: user.sub },
    })
    can('update', 'User', {
      sub: { $eq: user.sub },
    })
    can('manage', 'Avatar')
  },
}
