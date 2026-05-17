// Goal scoring per BRD Section 2.2
export type UomType =
  | "MIN_NUMERIC"
  | "MIN_PCT"
  | "MAX_NUMERIC"
  | "MAX_PCT"
  | "TIMELINE"
  | "ZERO";

export function computeScore(
  uomType: string,
  target: number | null | undefined,
  actual: number | null | undefined,
  deadline?: Date | null,
  actualDate?: Date | null,
): number {
  if (uomType === "ZERO") {
    return actual === 0 ? 100 : 0;
  }

  if (uomType === "TIMELINE") {
    if (!deadline || !actualDate) return 0;
    return actualDate.getTime() <= deadline.getTime() ? 100 : 0;
  }

  if (target == null || actual == null || target === 0) return 0;

  if (uomType === "MIN_NUMERIC" || uomType === "MIN_PCT") {
    // Higher is better
    return Math.min(100, Math.max(0, (actual / target) * 100));
  }

  if (uomType === "MAX_NUMERIC" || uomType === "MAX_PCT") {
    // Lower is better
    if (actual === 0) return 100;
    return Math.min(100, Math.max(0, (target / actual) * 100));
  }

  return 0;
}

export const UOM_LABELS: Record<string, string> = {
  MIN_NUMERIC: "Numeric — Higher is better",
  MIN_PCT: "Percentage — Higher is better",
  MAX_NUMERIC: "Numeric — Lower is better",
  MAX_PCT: "Percentage — Lower is better",
  TIMELINE: "Timeline — Date-based",
  ZERO: "Zero-based — Zero = success",
};

export const UOM_SHORT: Record<string, string> = {
  MIN_NUMERIC: "Numeric ↑",
  MIN_PCT: "% ↑",
  MAX_NUMERIC: "Numeric ↓",
  MAX_PCT: "% ↓",
  TIMELINE: "Timeline",
  ZERO: "Zero-based",
};

export const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
export type Quarter = (typeof QUARTERS)[number];

export function currentQuarter(date = new Date()): Quarter | null {
  const m = date.getMonth(); // 0-11
  // BRD: Q1 opens July, Q2 Oct, Q3 Jan, Q4 Mar/Apr
  if (m >= 6 && m <= 8) return "Q1";
  if (m >= 9 && m <= 11) return "Q2";
  if (m >= 0 && m <= 2) return "Q3";
  return "Q4";
}
