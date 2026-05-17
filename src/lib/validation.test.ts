import { describe, it, expect } from "vitest";
import {
  goalSchema,
  checkSubmitReady,
  validateGoalSheet,
  MAX_GOALS,
  MIN_WEIGHTAGE,
  TOTAL_WEIGHTAGE,
} from "./validation";

describe("goalSchema", () => {
  const validBase = {
    title: "Improve NPS to 60+",
    thrustAreaId: "thrust-1",
    uomType: "MIN_NUMERIC" as const,
    weightage: 20,
  };

  it("accepts a valid goal", () => {
    expect(goalSchema.safeParse(validBase).success).toBe(true);
  });

  it("rejects title < 3 chars", () => {
    expect(goalSchema.safeParse({ ...validBase, title: "ok" }).success).toBe(false);
  });

  it("rejects weightage below MIN_WEIGHTAGE", () => {
    const r = goalSchema.safeParse({ ...validBase, weightage: MIN_WEIGHTAGE - 1 });
    expect(r.success).toBe(false);
  });

  it("rejects weightage above 100", () => {
    expect(goalSchema.safeParse({ ...validBase, weightage: 101 }).success).toBe(false);
  });

  it("accepts MIN_WEIGHTAGE exactly", () => {
    expect(goalSchema.safeParse({ ...validBase, weightage: MIN_WEIGHTAGE }).success).toBe(true);
  });

  it("rejects unknown UoM types", () => {
    expect(goalSchema.safeParse({ ...validBase, uomType: "BOGUS" }).success).toBe(false);
  });

  it("accepts all six BRD UoM types", () => {
    const types = ["MIN_NUMERIC", "MIN_PCT", "MAX_NUMERIC", "MAX_PCT", "TIMELINE", "ZERO"];
    for (const t of types) {
      expect(goalSchema.safeParse({ ...validBase, uomType: t }).success).toBe(true);
    }
  });
});

describe("checkSubmitReady — BRD weightage rules", () => {
  it("rejects empty goal sheet", () => {
    const r = checkSubmitReady([]);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/at least one/i);
  });

  it("rejects > MAX_GOALS", () => {
    const goals = Array.from({ length: MAX_GOALS + 1 }, () => ({ weightage: 5 }));
    const r = checkSubmitReady(goals);
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/max/i);
  });

  it("accepts exactly MAX_GOALS with total 100%", () => {
    // 8 goals × 12.5% = 100
    const goals = Array.from({ length: MAX_GOALS }, () => ({ weightage: 12.5 }));
    expect(checkSubmitReady(goals).ok).toBe(true);
  });

  it("rejects when total weightage != 100", () => {
    expect(checkSubmitReady([{ weightage: 50 }, { weightage: 40 }]).ok).toBe(false);
    expect(checkSubmitReady([{ weightage: 60 }, { weightage: 50 }]).ok).toBe(false);
  });

  it("accepts exactly TOTAL_WEIGHTAGE", () => {
    const r = checkSubmitReady([{ weightage: 50 }, { weightage: 50 }]);
    expect(r.ok).toBe(true);
    expect(TOTAL_WEIGHTAGE).toBe(100);
  });

  it("rejects any goal below MIN_WEIGHTAGE", () => {
    const r = checkSubmitReady([
      { weightage: MIN_WEIGHTAGE - 1 },
      { weightage: 100 - MIN_WEIGHTAGE + 1 },
    ]);
    expect(r.ok).toBe(false);
  });

  it("treats 100.0 and 100.0001 as equal (float tolerance)", () => {
    expect(checkSubmitReady([{ weightage: 100 }]).ok).toBe(true);
    expect(checkSubmitReady([{ weightage: 33.333 }, { weightage: 33.333 }, { weightage: 33.334 }]).ok).toBe(true);
  });
});

describe("validateGoalSheet", () => {
  it("rejects adding a goal that would exceed MAX_GOALS", () => {
    const existing = Array.from({ length: MAX_GOALS }, (_, i) => ({
      weightage: 12,
      status: "DRAFT",
      id: `g${i}`,
    }));
    const r = validateGoalSheet({ goals: existing, newWeightage: 5 });
    expect(r.ok).toBe(false);
  });

  it("allows updates even at MAX_GOALS (excludeId)", () => {
    const existing = Array.from({ length: MAX_GOALS }, (_, i) => ({
      weightage: 12,
      status: "DRAFT",
      id: `g${i}`,
    }));
    const r = validateGoalSheet({ goals: existing, excludeId: "g0", newWeightage: 15 });
    expect(r.ok).toBe(true);
  });
});
