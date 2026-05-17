import { prisma } from "./db";

export async function logAudit(opts: {
  goalId?: string | null;
  actorId: string;
  action: string;
  field?: string;
  oldValue?: string | number | null;
  newValue?: string | number | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      goalId: opts.goalId ?? null,
      actorId: opts.actorId,
      action: opts.action,
      field: opts.field,
      oldValue: opts.oldValue != null ? String(opts.oldValue) : null,
      newValue: opts.newValue != null ? String(opts.newValue) : null,
      metadata: opts.metadata ? JSON.stringify(opts.metadata) : null,
    },
  });
}
