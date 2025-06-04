import { z } from 'zod'

import { roleSchema } from '../roles'

export const userSchema = z.object({
  id: z.string(),
  sub: z.string(),
  role: roleSchema,
  __typename: z.literal('User').default('User'),
})

export type User = z.infer<typeof userSchema>
