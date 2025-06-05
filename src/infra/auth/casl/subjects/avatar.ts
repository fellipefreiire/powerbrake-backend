import { z } from 'zod'
import { avatarSchema } from '../models/avatar'

export const avatarSubject = z.tuple([
  z.union([z.literal('manage'), z.literal('create')]),
  z.union([z.literal('Avatar'), avatarSchema]),
])

export type AvatarSubject = z.infer<typeof avatarSubject>
