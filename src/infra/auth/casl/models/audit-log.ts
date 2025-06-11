import { z } from 'zod'

import { roleSchema } from '../roles'

export const auditLogSchema = z.object({
  sub: z.string(),
  role: roleSchema,
  __typename: z.literal('AuditLog').default('AuditLog'),
})

export type AuditLog = z.infer<typeof auditLogSchema>
