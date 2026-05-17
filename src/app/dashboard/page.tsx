import { requireUser } from "@/lib/session";
import { EmployeeOverview } from "@/components/views/employee-overview";
import { ManagerOverview } from "@/components/views/manager-overview";
import { AdminOverview } from "@/components/views/admin-overview";

export default async function DashboardPage() {
  const user = await requireUser();
  if (user.role === "EMPLOYEE") return <EmployeeOverview userId={user.id} />;
  if (user.role === "MANAGER") return <ManagerOverview userId={user.id} />;
  return <AdminOverview />;
}
