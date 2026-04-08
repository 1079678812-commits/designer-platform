import { prisma } from './prisma'

type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'review' | 'payment' | 'register' | 'logout'
type AuditResource = 'user' | 'order' | 'service' | 'client' | 'contract' | 'invoice' | 'payment' | 'notification'

interface AuditInput {
  userId?: string
  action: AuditAction
  resource: AuditResource
  resourceId?: string
  detail?: string
  ip?: string
}

export async function auditLog(input: AuditInput) {
  try {
    await prisma.auditLog.create({ data: input })
  } catch (err) {
    console.error('Audit log failed:', err)
  }
}

// Helper to extract IP from request
export function getIpFromRequest(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}
