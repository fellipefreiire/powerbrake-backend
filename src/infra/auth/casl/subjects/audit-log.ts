import { z } from 'zod'
import { auditLogSchema } from '../models/audit-log'

export const auditLogSubject = z.tuple([
  z.union([z.literal('manage'), z.literal('list')]),
  z.union([z.literal('AuditLog'), auditLogSchema]),
])

export type AuditLogSubject = z.infer<typeof auditLogSubject>
