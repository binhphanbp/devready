import { Sidebar } from "@/components/layout/Sidebar";
import { ReadyBot } from "@/components/readybot/ReadyBot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh overflow-x-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </div>
      </main>
      <ReadyBot />
    </div>
  );
}
