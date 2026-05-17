import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withRole } from "@/lib/api";
import { currentQuarter } from "@/lib/scoring";
import { headers } from "next/headers";

/**
 * Escalation runner.
 *
 * Auth: admins can trigger via UI button (cookie session).
 * Cron: Vercel Cron hits this same route, passing the secret in the
 *   Authorization header so we can bypass cookie auth.
 */
export const POST = async (req: Request): Promise<Response> => {
  const h = await headers();
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = h.get("authorization");

  // If a valid cron secret is presented, bypass session auth
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return runEscalations();
  }

  // Otherwise require an admin session
  return withRole("ADMIN", async () => runEscalations())(req);
};

async function runEscalations(): Promise<Response> {
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) return NextResponse.json({ error: "No active cycle" }, { status: 400 });

  const now = new Date();
  let created = 0;

  // RULE 1: Employee hasn't submitted goals N days after Phase 1 opened
  if (now > cycle.goalSetOpen) {
    const overdueBy = (now.getTime() - cycle.goalSetOpen.getTime()) / (1000 * 60 * 60 * 24);
    if (overdueBy >= cycle.escSubmitDays) {
      const employees = await prisma.user.findMany({ where: { role: "EMPLOYEE" } });
      for (const e of employees) {
        const submitted = await prisma.goal.count({
          where: {
            ownerId: e.id,
            cycleId: cycle.id,
            status: { in: ["SUBMITTED", "APPROVED", "LOCKED"] },
          },
        });
        if (submitted === 0) {
          const exists = await prisma.escalation.findFirst({
            where: { targetId: e.id, ruleType: "SUBMIT", resolved: false },
          });
          if (!exists) {
            await prisma.escalation.create({
              data: {
                targetId: e.id,
                ruleType: "SUBMIT",
                level: 1,
                message: `${e.name} has not submitted goals for ${cycle.name} (${Math.floor(overdueBy)} days overdue).`,
              },
            });
            created++;
          }
        }
      }
    }
  }

  // RULE 2: Manager has SUBMITTED goals waiting >N days
  const submittedGoals = await prisma.goal.findMany({
    where: { status: "SUBMITTED", cycleId: cycle.id },
    include: { owner: { include: { manager: true } } },
  });
  for (const g of submittedGoals) {
    const ageDays = (now.getTime() - g.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (ageDays >= cycle.escApproveDays && g.owner.manager) {
      const exists = await prisma.escalation.findFirst({
        where: { targetId: g.owner.manager.id, ruleType: "APPROVE", resolved: false },
      });
      if (!exists) {
        await prisma.escalation.create({
          data: {
            targetId: g.owner.manager.id,
            ruleType: "APPROVE",
            level: 2,
            message: `${g.owner.name}'s submitted goal(s) awaiting approval for ${Math.floor(ageDays)} days.`,
          },
        });
        created++;
      }
    }
  }

  // RULE 3: Quarterly check-in not done within window
  const q = currentQuarter();
  if (q) {
    const approvedGoals = await prisma.goal.findMany({
      where: { status: { in: ["APPROVED", "LOCKED"] }, cycleId: cycle.id },
      include: { checkIns: true, owner: true },
    });
    for (const g of approvedGoals) {
      const hasQ = g.checkIns.some((c) => c.quarter === q);
      if (!hasQ) {
        const qOpenDate =
          q === "Q1"
            ? cycle.q1Open
            : q === "Q2"
              ? cycle.q2Open
              : q === "Q3"
                ? cycle.q3Open
                : cycle.q4Open;
        const ageDays = (now.getTime() - qOpenDate.getTime()) / (1000 * 60 * 60 * 24);
        if (ageDays >= cycle.escCheckinDays) {
          const exists = await prisma.escalation.findFirst({
            where: { targetId: g.owner.id, ruleType: "CHECKIN", resolved: false },
          });
          if (!exists) {
            await prisma.escalation.create({
              data: {
                targetId: g.owner.id,
                ruleType: "CHECKIN",
                level: 1,
                message: `${g.owner.name} has not completed ${q} check-in (window opened ${Math.floor(ageDays)} days ago).`,
              },
            });
            created++;
          }
        }
      }
    }
  }

  return NextResponse.json({ ok: true, created });
}
