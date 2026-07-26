import { AppNavbar } from "@/components/navigation/app-navbar";

export default function NotebooksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-svh bg-[#f6f3ee]">
      <AppNavbar />
      {children}
    </div>
  );
}
