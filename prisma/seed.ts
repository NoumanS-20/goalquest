import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding...");

  // Clear (dev only)
  await prisma.session.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.checkInComment.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.sharedGoal.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.thrustArea.deleteMany();
  await prisma.user.deleteMany();

  const pwd = await bcrypt.hash("demo1234", 10);

  // Thrust Areas
  const thrusts = await Promise.all(
    [
      { name: "Revenue Growth", color: "#10b981" },
      { name: "Operational Excellence", color: "#3b82f6" },
      { name: "Customer Experience", color: "#a855f7" },
      { name: "Innovation", color: "#f59e0b" },
      { name: "People & Culture", color: "#ec4899" },
      { name: "Safety & Compliance", color: "#ef4444" },
      { name: "Sustainability", color: "#22c55e" },
    ].map((t) => prisma.thrustArea.create({ data: t })),
  );

  // Users
  const _admin = await prisma.user.create({
    data: {
      email: "admin@atomberg.com",
      name: "Aanya Sharma",
      password: pwd,
      role: "ADMIN",
      department: "Human Resources",
      designation: "Head of People Ops",
    },
  });

  const mgrSales = await prisma.user.create({
    data: {
      email: "rohan@atomberg.com",
      name: "Rohan Mehta",
      password: pwd,
      role: "MANAGER",
      department: "Sales",
      designation: "VP — Sales",
    },
  });

  const mgrEng = await prisma.user.create({
    data: {
      email: "priya@atomberg.com",
      name: "Priya Iyer",
      password: pwd,
      role: "MANAGER",
      department: "Engineering",
      designation: "Director — Engineering",
    },
  });

  const empSales1 = await prisma.user.create({
    data: {
      email: "kabir@atomberg.com",
      name: "Kabir Singh",
      password: pwd,
      role: "EMPLOYEE",
      department: "Sales",
      designation: "Regional Sales Lead",
      managerId: mgrSales.id,
    },
  });

  const empSales2 = await prisma.user.create({
    data: {
      email: "anika@atomberg.com",
      name: "Anika Verma",
      password: pwd,
      role: "EMPLOYEE",
      department: "Sales",
      designation: "Key Account Manager",
      managerId: mgrSales.id,
    },
  });

  const empEng1 = await prisma.user.create({
    data: {
      email: "vikram@atomberg.com",
      name: "Vikram Joshi",
      password: pwd,
      role: "EMPLOYEE",
      department: "Engineering",
      designation: "Senior Engineer",
      managerId: mgrEng.id,
    },
  });

  const empEng2 = await prisma.user.create({
    data: {
      email: "meera@atomberg.com",
      name: "Meera Krishnan",
      password: pwd,
      role: "EMPLOYEE",
      department: "Engineering",
      designation: "Product Engineer",
      managerId: mgrEng.id,
    },
  });

  // Cycle: FY 2026 (May 2026 — April 2027)
  const cycle = await prisma.cycle.create({
    data: {
      name: "FY 2026-27",
      startDate: new Date("2026-05-01"),
      endDate: new Date("2027-04-30"),
      isActive: true,
      goalSetOpen: new Date("2026-05-01"),
      q1Open: new Date("2026-07-01"),
      q2Open: new Date("2026-10-01"),
      q3Open: new Date("2027-01-01"),
      q4Open: new Date("2027-03-15"),
    },
  });

  // Kabir's goals (APPROVED + Q1 check-in done)
  const kg1 = await prisma.goal.create({
    data: {
      title: "Achieve ₹12 Cr regional sales revenue",
      description: "Hit FY revenue target for the West region across all SKUs.",
      thrustAreaId: thrusts[0].id,
      uomType: "MIN_NUMERIC",
      uomLabel: "₹ Cr",
      target: 12,
      weightage: 40,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empSales1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-10"),
      lockedAt: new Date("2026-05-10"),
    },
  });
  const kg2 = await prisma.goal.create({
    data: {
      title: "Reduce avg dealer TAT to 3 days",
      description: "Order-to-dispatch turnaround time for dealer orders.",
      thrustAreaId: thrusts[1].id,
      uomType: "MAX_NUMERIC",
      uomLabel: "days",
      target: 3,
      weightage: 25,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empSales1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-10"),
      lockedAt: new Date("2026-05-10"),
    },
  });
  const _kg3 = await prisma.goal.create({
    data: {
      title: "Launch loyalty programme in West region",
      description: "Programme live across 200+ dealers by 30-Sep.",
      thrustAreaId: thrusts[2].id,
      uomType: "TIMELINE",
      target: null,
      deadline: new Date("2026-09-30"),
      weightage: 20,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empSales1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-10"),
      lockedAt: new Date("2026-05-10"),
    },
  });
  const kg4 = await prisma.goal.create({
    data: {
      title: "Zero compliance incidents in field operations",
      thrustAreaId: thrusts[5].id,
      uomType: "ZERO",
      target: 0,
      weightage: 15,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empSales1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-10"),
      lockedAt: new Date("2026-05-10"),
    },
  });

  // Kabir's Q1 check-ins
  await prisma.checkIn.createMany({
    data: [
      { goalId: kg1.id, quarter: "Q1", actualValue: 3.2, score: (3.2 / 12) * 100, notes: "Q1 closed strong. Pipeline healthy." },
      { goalId: kg2.id, quarter: "Q1", actualValue: 3.4, score: (3 / 3.4) * 100, notes: "Improved from 4.1 baseline." },
      { goalId: kg4.id, quarter: "Q1", actualValue: 0, score: 100, notes: "No incidents reported." },
    ],
  });

  await prisma.checkInComment.create({
    data: {
      goalId: kg1.id,
      authorId: mgrSales.id,
      quarter: "Q1",
      comment: "Great traction in Q1. Let's push on Tier-2 cities for Q2.",
    },
  });

  // Anika's goals — SUBMITTED, awaiting Rohan's approval
  await prisma.goal.create({
    data: {
      title: "Onboard 15 new modern-trade chains",
      thrustAreaId: thrusts[0].id,
      uomType: "MIN_NUMERIC",
      uomLabel: "chains",
      target: 15,
      weightage: 35,
      status: "SUBMITTED",
      ownerId: empSales2.id,
      cycleId: cycle.id,
    },
  });
  await prisma.goal.create({
    data: {
      title: "NPS score ≥ 65 for key accounts",
      thrustAreaId: thrusts[2].id,
      uomType: "MIN_NUMERIC",
      uomLabel: "NPS",
      target: 65,
      weightage: 30,
      status: "SUBMITTED",
      ownerId: empSales2.id,
      cycleId: cycle.id,
    },
  });
  await prisma.goal.create({
    data: {
      title: "Account renewals — 95% retention",
      thrustAreaId: thrusts[0].id,
      uomType: "MIN_PCT",
      uomLabel: "%",
      target: 95,
      weightage: 20,
      status: "SUBMITTED",
      ownerId: empSales2.id,
      cycleId: cycle.id,
    },
  });
  await prisma.goal.create({
    data: {
      title: "Zero key-account churn in Tier-1 cities",
      thrustAreaId: thrusts[5].id,
      uomType: "ZERO",
      target: 0,
      weightage: 15,
      status: "SUBMITTED",
      ownerId: empSales2.id,
      cycleId: cycle.id,
    },
  });

  // Vikram's goals — APPROVED
  await prisma.goal.create({
    data: {
      title: "Reduce p95 API latency to 200ms",
      thrustAreaId: thrusts[1].id,
      uomType: "MAX_NUMERIC",
      uomLabel: "ms",
      target: 200,
      weightage: 30,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empEng1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-12"),
      lockedAt: new Date("2026-05-12"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Ship IoT firmware v3 by Sep",
      thrustAreaId: thrusts[3].id,
      uomType: "TIMELINE",
      deadline: new Date("2026-09-15"),
      weightage: 40,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empEng1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-12"),
      lockedAt: new Date("2026-05-12"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Code coverage ≥ 80%",
      thrustAreaId: thrusts[1].id,
      uomType: "MIN_PCT",
      uomLabel: "%",
      target: 80,
      weightage: 20,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empEng1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-12"),
      lockedAt: new Date("2026-05-12"),
    },
  });
  await prisma.goal.create({
    data: {
      title: "Zero P0 production incidents",
      thrustAreaId: thrusts[5].id,
      uomType: "ZERO",
      target: 0,
      weightage: 10,
      status: "APPROVED",
      progressStatus: "ON_TRACK",
      ownerId: empEng1.id,
      cycleId: cycle.id,
      approvedAt: new Date("2026-05-12"),
      lockedAt: new Date("2026-05-12"),
    },
  });

  // Meera — DRAFT (some goals being built up)
  await prisma.goal.create({
    data: {
      title: "Launch consumer fan-control app v2",
      thrustAreaId: thrusts[3].id,
      uomType: "TIMELINE",
      deadline: new Date("2026-08-30"),
      weightage: 50,
      status: "DRAFT",
      ownerId: empEng2.id,
      cycleId: cycle.id,
    },
  });
  await prisma.goal.create({
    data: {
      title: "Improve app store rating to 4.6",
      thrustAreaId: thrusts[2].id,
      uomType: "MIN_NUMERIC",
      uomLabel: "stars",
      target: 4.6,
      weightage: 30,
      status: "DRAFT",
      ownerId: empEng2.id,
      cycleId: cycle.id,
    },
  });

  // A few audit logs
  await prisma.auditLog.createMany({
    data: [
      { actorId: empSales1.id, goalId: kg1.id, action: "CREATE", newValue: "Goal created" },
      { actorId: mgrSales.id, goalId: kg1.id, action: "APPROVE", newValue: "Approved by Rohan Mehta" },
      { actorId: empSales1.id, goalId: kg1.id, action: "CHECKIN", field: "Q1", newValue: "3.2 ₹ Cr" },
    ],
  });

  // An escalation example
  await prisma.escalation.create({
    data: {
      ruleType: "APPROVE",
      targetId: mgrSales.id,
      level: 2,
      message: "4 goals from Anika Verma awaiting approval for over 5 days.",
    },
  });

  console.log("✓ Seeded:");
  console.log("  Admin   →  admin@atomberg.com  /  demo1234");
  console.log("  Manager →  rohan@atomberg.com  /  demo1234");
  console.log("  Employee→  kabir@atomberg.com  /  demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
