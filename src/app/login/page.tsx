import Link from "next/link";
import { redirect } from "next/navigation";
import { Target } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  // Load demo accounts for one-click switching
  const accounts = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, designation: true, department: true },
    orderBy: { role: "asc" },
  });

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-brand-gradient text-white p-12 flex-col justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="h-7 w-7 rounded-md bg-white/20 grid place-items-center backdrop-blur">
            <Target className="h-4 w-4" />
          </div>
          GoalQuest
        </Link>
        <div className="absolute inset-0 bg-dot-grid opacity-20" />
        <div className="relative">
          <Badge className="bg-white/20 text-white border-0 mb-4">AtomQuest Hackathon 1.0</Badge>
          <h2 className="text-4xl font-bold leading-tight">
            From scattered spreadsheets to one source of truth.
          </h2>
          <p className="mt-4 text-white/80 max-w-md">
            GoalQuest closes the loop between strategy and execution — drafting,
            approving, tracking, and reporting on every employee goal across the
            organisation.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            <Stat n="100%" l="weightage validation" />
            <Stat n="8" l="goals per employee max" />
            <Stat n="10%" l="min weightage" />
          </div>
        </div>
        <div className="relative text-xs text-white/70">
          © 2026 — A submission for AtomQuest Hackathon
        </div>
      </div>

      {/* Right login */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 animate-fade-up">
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="h-7 w-7 rounded-md bg-brand-gradient grid place-items-center">
              <Target className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">GoalQuest</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Sign in with the seeded credentials or one-click into a role below.
            </p>
          </div>

          <LoginForm accounts={accounts} />

          <p className="text-center text-xs text-muted-foreground">
            Need new credentials? Use <code className="font-mono">demo1234</code> as the password for every seeded account.
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="rounded-lg bg-white/10 p-3 backdrop-blur">
      <div className="text-2xl font-bold">{n}</div>
      <div className="text-[10px] uppercase tracking-wide text-white/70">{l}</div>
    </div>
  );
}
