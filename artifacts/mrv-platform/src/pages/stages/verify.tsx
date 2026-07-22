import { PageContainer } from "@/components/layout/PageContainer";
import { useListAuditEvents } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Beaker, Search, Filter, ShieldCheck, UserCheck, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function VerifyStage() {
  const { data: events, isLoading } = useListAuditEvents();

  return (
    <PageContainer 
      title="Verify & Audit" 
      description="Immutable audit trail and third-party verification workspace"
      action={
        <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 border border-border rounded-sm text-sm font-medium hover:bg-primary/20 hover:text-primary transition-colors">
          <UserCheck className="w-4 h-4" />
          <span>Invite Auditor</span>
        </button>
      }
    >
      <div className="bg-card border border-border rounded-sm flex flex-col h-[700px]">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-sidebar/30">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search audit trail by batch, actor, or action..." 
              className="w-full h-9 bg-background border border-border rounded-sm pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background rounded-sm text-sm font-medium hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter Trail</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {isLoading || !events ? (
              <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="w-32 h-4 shrink-0 bg-secondary" />
                    <Skeleton className="w-4 h-4 rounded-full shrink-0 bg-secondary" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-secondary" />
                      <Skeleton className="h-4 w-1/2 bg-secondary" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">No audit events recorded yet.</p>
              </div>
            ) : (
              <div className="relative border-l border-border/50 ml-16 md:ml-32 py-4 space-y-10">
                {events.map((event) => (
                  <div key={event.id} className="relative pl-8 group">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-border group-hover:bg-primary transition-colors ring-4 ring-card" />
                    <div className="absolute -left-32 md:-left-40 top-0.5 w-28 md:w-36 text-right">
                      <div className="text-xs font-mono text-muted-foreground">{format(new Date(event.createdAt), 'MMM dd, yyyy')}</div>
                      <div className="text-[10px] font-mono text-muted-foreground/50">{format(new Date(event.createdAt), 'HH:mm:ss')}</div>
                    </div>
                    
                    <div className="bg-secondary/20 border border-border rounded-sm p-4 group-hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-background border border-border text-[10px] font-mono uppercase tracking-widest text-foreground rounded-sm">
                          {event.action.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-sm border border-primary/20">
                          {event.entityType.toUpperCase()} {event.entityId}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-3">{event.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-mono text-primary">
                            {event.actor.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-mono">{event.actor}</span>
                        </div>
                        {event.batchId && <span className="font-mono">Batch: {event.batchId}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}