import { NotebookPage } from "@/components/notebooks/notebook-page";
import { requirePageUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function Page({ params }: PageProps<"/notebooks/[notebookId]">) {
  await requirePageUser();
  const { notebookId } = await params;
  return <NotebookPage notebookId={notebookId} />;
}
