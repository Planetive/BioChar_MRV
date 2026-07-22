import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full bg-background text-foreground overflow-hidden selection:bg-primary/30">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(26,188,156,0.03)_0%,transparent_100%)]" />
          <div className="max-w-[1400px] mx-auto h-full relative">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
