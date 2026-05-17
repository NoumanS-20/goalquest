import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { QUARTERS } from "@/lib/scoring";

function esc(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  await requireRole("ADMIN");
  const cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  const goals = await prisma.goal.findMany({
    where: { cycleId: cycle?.id },
    include: {
      owner: { include: { manager: true } },
      thrustArea: true,
      checkIns: true,
    },
    orderBy: [{ owner: { name: "asc" } }, { createdAt: "asc" }],
  });

  const headers = [
    "Employee",
    "Department",
    "Manager",
    "Thrust Area",
    "Goal Title",
    "UoM",
    "Target",
    "Unit",
    "Deadline",
    "Weightage %",
    "Status",
    ...QUARTERS.flatMap((q) => [`${q} Actual`, `${q} Score %`]),
    "Latest Score %",
  ];

  const rows = goals.map((g) => {
    const qData = QUARTERS.flatMap((q) => {
      const c = g.checkIns.find((x) => x.quarter === q);
      const actual = c?.actualValue ?? (c?.actualDate ? c.actualDate.toISOString().slice(0, 10) : "");
      return [actual, c ? Math.round(c.score) : ""];
    });
    const latest = [...g.checkIns].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return [
      g.owner.name,
      g.owner.department ?? "",
      g.owner.manager?.name ?? "",
      g.thrustArea.name,
      g.title,
      g.uomType,
      g.target ?? "",
      g.uomLabel ?? "",
      g.deadline ? g.deadline.toISOString().slice(0, 10) : "",
      g.weightage,
      g.status,
      ...qData,
      latest ? Math.round(latest.score) : "",
    ];
  });

  const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="achievement-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
