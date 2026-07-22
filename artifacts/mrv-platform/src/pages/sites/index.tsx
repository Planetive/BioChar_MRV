import { PageContainer } from "@/components/layout/PageContainer";
import { useListSites } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plus, Activity, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const StatusColors: Record<string, string> = {
  active: "text-primary bg-primary/10 border-primary/20",
  inactive: "text-muted-foreground bg-secondary border-border",
  pending: "text-accent bg-accent/10 border-accent/20",
};

export default function Sites() {
  const { data: sites, isLoading } = useListSites();

  return (
    <PageContainer 
      title="Production Sites" 
      description="Manage biochar production facilities and hardware assets"
      action={
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover-elevate transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Site</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading || !sites ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full bg-card" />)
        ) : sites.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-sm">
            <MapPin className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground">No sites configured.</p>
          </div>
        ) : (
          sites.map((site) => (
            <div key={site.id} className="bg-card border border-border rounded-sm p-6 hover:border-primary/50 transition-colors group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{site.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <MapPin className="w-3.5 h-3.5" />
                    {site.location}{site.country ? `, ${site.country}` : ''}
                  </div>
                </div>
                <span className={cn("px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm flex items-center gap-1", StatusColors[site.status])}>
                  {site.status === 'active' && <Activity className="w-3 h-3" />}
                  {site.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                  {site.status}
                </span>
              </div>
              
              <div className="flex-1 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/30 border border-border/50 rounded-sm">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Timezone</div>
                    <div className="text-sm font-medium">{site.timezone || 'UTC'}</div>
                  </div>
                  <div className="p-3 bg-secondary/30 border border-border/50 rounded-sm">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Added</div>
                    <div className="text-sm font-medium">{format(new Date(site.createdAt), 'MMM yyyy')}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border flex justify-end">
                <button className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  Manage Hardware &rarr;
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PageContainer>
  );
}