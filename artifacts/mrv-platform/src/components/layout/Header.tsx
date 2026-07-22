import { Search, Bell, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-64 md:w-80 group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search batches, sites, alerts..." 
            className="w-full h-9 bg-card border border-border rounded-sm pl-9 pr-3 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-primary uppercase tracking-wider font-bold">System Nominal</span>
        </div>

        <ThemeToggle />
        
        <div className="flex items-center gap-1 border-l border-border pl-4 md:pl-6">
          <Link href="/assurance" className="relative p-2 text-muted-foreground hover:text-accent transition-colors">
            <ShieldAlert className="w-5 h-5" />
          </Link>
          <Link href="/notifications" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background" />
          </Link>
        </div>
      </div>
    </header>
  );
}
