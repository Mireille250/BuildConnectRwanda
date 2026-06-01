/**
 * User roles for BuildConnect Rwanda.
 * Used in JWT payloads, RBAC guards, and frontend route protection.
 * Keep this in sync with the Prisma schema Role enum.
 */
export enum Role {
  CLIENT   = 'CLIENT',
  ENGINEER = 'ENGINEER',
  WORKER   = 'WORKER',
  COMPANY  = 'COMPANY',
  SUPPLIER = 'SUPPLIER',
  ADMIN    = 'ADMIN',
}