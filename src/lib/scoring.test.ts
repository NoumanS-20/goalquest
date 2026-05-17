import { describe, it, expect } from "vitest";
import {
  computeScore,
  currentQuarter,
  currentQuarterForCycle,
  isQuarterOpen,
  openedQuarters,
  QUARTERS,
} from "./scoring";

describe("computeScore — BRD formulas", () => {
  describe("ZERO (zero = success)", () => {
    it("returns 100% when actual is 0", () => {
      expect(computeScore("ZERO", 0, 0)).toBe(100);
    });
    it("returns 0% when actual is non-zero", () => {
      expect(computeScore("ZERO", 0, 1)).toBe(0);
      expect(computeScore("ZERO", 0, 5)).toBe(0);
    });
    it("returns 0% when actual is null", () => {
      expect(computeScore("ZERO", 0, null)).toBe(0);
    });
  });

  describe("TIMELINE (date-based)", () => {
    const deadline = new Date("2026-07-31");

    it("returns 100% when completed on or before deadline", () => {
      expect(computeScore("TIMELINE", null, null, deadline, new Date("2026-07-31"))).toBe(100);
      expect(computeScore("TIMELINE", null, null, deadline, new Date("2026-07-15"))).toBe(100);
    });
    it("returns 0% when completed after deadline", () => {
      expect(computeScore("TIMELINE", null, null, deadline, new Date("2026-08-01"))).toBe(0);
    });
    it("returns 0% when either date is missing", () => {
      expect(computeScore("TIMELINE", null, null, deadline, null)).toBe(0);
      expect(computeScore("TIMELINE", null, null, null, new Date())).toBe(0);
    });
  });

  describe("MIN (higher is better)", () => {
    it.each(["MIN_NUMERIC", "MIN_PCT"] as const)("computes Achievement ÷ Target for %s", (uom) => {
      // hit 100% of target → 100
      expect(computeScore(uom, 100, 100)).toBe(100);
      // hit 75% of target → 75
      expect(computeScore(uom, 100, 75)).toBe(75);
      // exceed target → capped at 100
      expect(computeScore(uom, 100, 150)).toBe(100);
      // 0 actual → 0
      expect(computeScore(uom, 100, 0)).toBe(0);
    });
  });

  describe("MAX (lower is better)", () => {
    it.each(["MAX_NUMERIC", "MAX_PCT"] as const)("computes Target ÷ Achievement for %s", (uom) => {
      // hit target exactly → 100
      expect(computeScore(uom, 10, 10)).toBe(100);
      // double the target → 50
      expect(computeScore(uom, 10, 20)).toBe(50);
      // half the target → capped at 100
      expect(computeScore(uom, 10, 5)).toBe(100);
      // 0 actual is perfect (no defects) → 100
      expect(computeScore(uom, 10, 0)).toBe(100);
    });
  });

  describe("edge cases", () => {
    it("returns 0 when uom is unrecognised", () => {
      expect(computeScore("WAT", 100, 100)).toBe(0);
    });
    it("returns 0 when target is 0 for ratio UoMs", () => {
      expect(computeScore("MIN_NUMERIC", 0, 50)).toBe(0);
    });
    it("returns 0 when actual is null for ratio UoMs", () => {
      expect(computeScore("MIN_NUMERIC", 100, null)).toBe(0);
    });
  });
});

describe("currentQuarter — BRD windows", () => {
  it("returns Q1 in Jul, Aug, Sep", () => {
    expect(currentQuarter(new Date("2026-07-15"))).toBe("Q1");
    expect(currentQuarter(new Date("2026-08-01"))).toBe("Q1");
    expect(currentQuarter(new Date("2026-09-30"))).toBe("Q1");
  });
  it("returns Q2 in Oct, Nov, Dec", () => {
    expect(currentQuarter(new Date("2026-10-01"))).toBe("Q2");
    expect(currentQuarter(new Date("2026-12-31"))).toBe("Q2");
  });
  it("returns Q3 in Jan and Feb", () => {
    expect(currentQuarter(new Date("2027-01-15"))).toBe("Q3");
    expect(currentQuarter(new Date("2027-02-28"))).toBe("Q3");
  });
  it("returns Q4 in Mar and Apr", () => {
    expect(currentQuarter(new Date("2027-03-15"))).toBe("Q4");
    expect(currentQuarter(new Date("2027-04-01"))).toBe("Q4");
  });
  it("returns null during goal-setting months before Q1", () => {
    expect(currentQuarter(new Date("2026-05-15"))).toBeNull();
    expect(currentQuarter(new Date("2026-06-30"))).toBeNull();
  });
  it("exports QUARTERS in canonical order", () => {
    expect(QUARTERS).toEqual(["Q1", "Q2", "Q3", "Q4"]);
  });
});

describe("cycle-aware check-in windows", () => {
  const cycle = {
    q1Open: new Date("2026-07-01"),
    q2Open: new Date("2026-10-01"),
    q3Open: new Date("2027-01-01"),
    q4Open: new Date("2027-03-15"),
    endDate: new Date("2027-04-30"),
  };

  it("keeps all quarterly check-ins closed during goal setting", () => {
    expect(openedQuarters(cycle, new Date("2026-05-17"))).toEqual([]);
    expect(currentQuarterForCycle(cycle, new Date("2026-05-17"))).toBeNull();
    expect(isQuarterOpen(cycle, "Q1", new Date("2026-05-17"))).toBe(false);
  });

  it("returns the latest opened quarter from configured dates", () => {
    expect(currentQuarterForCycle(cycle, new Date("2026-07-01"))).toBe("Q1");
    expect(currentQuarterForCycle(cycle, new Date("2026-12-01"))).toBe("Q2");
    expect(currentQuarterForCycle(cycle, new Date("2027-03-01"))).toBe("Q3");
    expect(currentQuarterForCycle(cycle, new Date("2027-03-15"))).toBe("Q4");
  });
});
