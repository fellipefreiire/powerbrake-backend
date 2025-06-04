import { z } from 'zod'
import { userSchema } from '../models/user'

export const userSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('list'),
    z.literal('read'),
    z.literal('update'),
    z.literal('activate'),
    z.literal('deactivate'),
    z.literal('update-role'),
  ]),
  z.union([z.literal('User'), userSchema]),
])

export type UserSubject = z.infer<typeof userSubject>
