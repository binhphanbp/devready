import { Sidebar } from "@/components/layout/Sidebar";
import { ReadyBot } from "@/components/readybot/ReadyBot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.6_0.24_260_/_4%),transparent_50%)] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {children}
        </div>
      </main>
      <ReadyBot />
    </div>
  );
}
