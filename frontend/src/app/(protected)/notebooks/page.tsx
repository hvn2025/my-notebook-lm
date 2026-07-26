import { NotebookDashboard } from "@/components/notebooks/notebook-dashboard";
import { requirePageUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NotebooksPage() {
  await requirePageUser();
  return <NotebookDashboard />;
}
