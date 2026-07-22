import { Link, useLocation } from "wouter";
import { LayoutDashboard, List, Beaker, ClipboardCheck, ShieldCheck, Scale, FileBarChart, MapPin, Bell, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { name: "Executive Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Batch Registry", href: "/batches", icon: List },
];

const pipelineStages = [
  { name: "Collect", href: "/collect", icon: Hexagon },
  { name: "Quantify", href: "/quantify", icon: Scale },
  { name: "Assurance", href: "/assurance", icon: ShieldCheck },
  { name: "Verify", href: "/verify", icon: Beaker },
  { name: "Comply", href: "/comply", icon: ClipboardCheck },
  { name: "Report", href: "/report", icon: FileBarChart },
];

const secondaryNav = [
  { name: "Sites", href: "/sites", icon: MapPin },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
  const [location] = useLocation();

  const isCurrent = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="w-64 flex-shrink-0 border-r border-border bg-sidebar h-full flex flex-col relative z-30">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
            <Hexagon className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono font-bold tracking-tight text-foreground">CARBON<span className="text-primary">MRV</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-8">
        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 px-2">Overview</div>
          <nav className="flex flex-col gap-1">
            {mainNav.map((item) => {
              const active = isCurrent(item.href);
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 px-2">Pipeline Stages</div>
          <nav className="flex flex-col relative">
            <div className="absolute left-5 top-4 bottom-4 w-px bg-border -z-10" />
            {pipelineStages.map((item) => {
              const active = isCurrent(item.href);
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-4 px-2 py-2 rounded-md group transition-colors",
                  active ? "text-primary" : "text-sidebar-foreground hover:text-foreground"
                )}>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border bg-sidebar transition-colors z-10",
                    active ? "border-primary bg-primary/10 text-primary" : "border-border group-hover:border-sidebar-foreground"
                  )}>
                    <item.icon className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-3 px-2">System</div>
          <nav className="flex flex-col gap-1">
            {secondaryNav.map((item) => {
              const active = isCurrent(item.href);
              return (
                <Link key={item.name} href={item.href} className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-secondary hover:text-foreground"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-border bg-sidebar/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-mono text-xs border border-border text-foreground">
            CO
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Officer Terminal</span>
            <span className="text-[10px] font-mono text-primary">ID: 8492-AC</span>
          </div>
        </div>
      </div>
    </div>
  );
}