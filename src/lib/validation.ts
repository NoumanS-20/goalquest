import { z } from "zod";

export const MAX_GOALS = 8;
export const MIN_WEIGHTAGE = 10;
export const TOTAL_WEIGHTAGE = 100;

export const goalSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().max(1000).optional().nullable(),
  thrustAreaId: z.string().min(1, "Thrust area is required"),
  uomType: z.enum(["MIN_NUMERIC", "MIN_PCT", "MAX_NUMERIC", "MAX_PCT", "TIMELINE", "ZERO"]),
  uomLabel: z.string().max(50).optional().nullable(),
  target: z.number().nullable().optional(),
  deadline: z.string().nullable().optional(), // ISO date
  weightage: z
    .number()
    .min(MIN_WEIGHTAGE, `Min ${MIN_WEIGHTAGE}%`)
    .max(100, "Max 100%"),
});

export type GoalInput = z.infer<typeof goalSchema>;

export function validateGoalSheet(opts: {
  goals: { weightage: number; status: string; id?: string }[];
  excludeId?: string;
  newWeightage?: number;
}): { ok: boolean; reason?: string } {
  const active = opts.goals.filter((g) => g.id !== opts.excludeId);
  if (active.length >= MAX_GOALS && opts.newWeightage != null) {
    return { ok: false, reason: `Cannot exceed ${MAX_GOALS} goals per employee.` };
  }
  return { ok: true };
}

export function checkSubmitReady(goals: { weightage: number }[]): {
  ok: boolean;
  reason?: string;
} {
  if (goals.length === 0) return { ok: false, reason: "Add at least one goal." };
  if (goals.length > MAX_GOALS) return { ok: false, reason: `Max ${MAX_GOALS} goals allowed.` };
  const total = goals.reduce((s, g) => s + g.weightage, 0);
  if (Math.abs(total - TOTAL_WEIGHTAGE) > 0.001) {
    return { ok: false, reason: `Total weightage must be exactly 100% — currently ${total}%.` };
  }
  for (const g of goals) {
    if (g.weightage < MIN_WEIGHTAGE) return { ok: false, reason: `Each goal must be ≥ ${MIN_WEIGHTAGE}%.` };
  }
  return { ok: true };
}
