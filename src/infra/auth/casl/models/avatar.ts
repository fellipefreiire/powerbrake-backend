import { z } from 'zod'

export const avatarSchema = z.object({
  sub: z.string(),
  __typename: z.literal('Avatar').default('Avatar'),
})

export type Avatar = z.infer<typeof avatarSchema>
