import { z } from 'zod'
import { roleSchema } from '../roles'

export const avatarSchema = z.object({
  sub: z.string(),
  role: roleSchema,
  __typename: z.literal('Avatar').default('Avatar'),
})

export type Avatar = z.infer<typeof avatarSchema>
