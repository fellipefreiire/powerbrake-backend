import {
  AbilityBuilder,
  createMongoAbility,
  type CreateAbility,
  type MongoAbility,
} from '@casl/ability'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { z } from 'zod'
import { userSubject } from './subjects/user'
import { permissions } from './permissions'
import type { User } from './models/user'

export const appAbilitiesSchema = z.union([
  userSubject,
  z.tuple([z.literal('manage'), z.literal('all')]),
])
type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

@Injectable()
export class CaslAbilityFactory {
  defineAbilityFor(user: User) {
    const builder = new AbilityBuilder(createAppAbility)

    if (typeof permissions[user.role] !== 'function') {
      throw new ForbiddenException(
        `Permissions for role ${user.role} not found.`,
      )
    }

    permissions[user.role](user, builder)

    const ability = builder.build({
      detectSubjectType(subject) {
        return subject.__typename
      },
    })

    ability.can = ability.can.bind(ability)
    ability.cannot = ability.cannot.bind(ability)
    return ability
  }
}
