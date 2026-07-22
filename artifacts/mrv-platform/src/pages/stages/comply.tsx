import { PageContainer } from "@/components/layout/PageContainer";
import { useListComplianceDeadlines } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const StatusColors: Record<string, string> = {
  upcoming: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  due_soon: "text-accent bg-accent/10 border-accent/20",
  overdue: "text-destructive bg-destructive/10 border-destructive/20",
  completed: "text-muted-foreground bg-secondary border-border",
  waived: "text-muted-foreground bg-secondary/50 border-border border-dashed",
};

export default function ComplyStage() {
  const { data: deadlines, isLoading } = useListComplianceDeadlines();

  return (
    <PageContainer 
      title="Compliance Calendar" 
      description="Registry deadlines, audit windows, and conflict detection"
      action={
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-sm border border-border text-sm font-medium">
          <Calendar className="w-4 h-4" />
          <span>Current Year</span>
        </div>
      }
    >
      <div className="flex gap-6 h-[600px]">
        {/* Calendar/List View */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Upcoming Deadlines</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {isLoading || !deadlines ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full bg-card border border-border rounded-sm" />)
            ) : deadlines.length === 0 ? (
              <div className="h-40 flex items-center justify-center border border-dashed border-border rounded-sm">
                <span className="text-muted-foreground">No compliance deadlines found.</span>
              </div>
            ) : (
              deadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(deadline => {
                const daysUntil = differenceInDays(new Date(deadline.dueDate), new Date());
                const urgency = deadline.status === 'overdue' || isPast(new Date(deadline.dueDate)) && !isToday(new Date(deadline.dueDate));
                
                return (
                  <div key={deadline.id} className="bg-card border border-border rounded-sm p-4 hover:border-primary/50 transition-colors group">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex gap-4">
                        <div className={cn(
                          "w-12 h-12 flex flex-col items-center justify-center rounded-sm border shrink-0",
                          urgency && deadline.status !== 'completed' ? "bg-destructive/10 border-destructive/30 text-destructive" : 
                          deadline.status === 'completed' ? "bg-secondary border-border text-muted-foreground" :
                          "bg-primary/10 border-primary/20 text-primary"
                        )}>
                          <span className="text-xs font-mono uppercase leading-none mb-1">{format(new Date(deadline.dueDate), 'MMM')}</span>
                          <span className="text-lg font-bold leading-none">{format(new Date(deadline.dueDate), 'dd')}</span>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-sm", StatusColors[deadline.status])}>
                              {deadline.status.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-0.5 bg-secondary rounded-sm">
                              {deadline.registry.replace('_', ' ')}
                            </span>
                          </div>
                          <h4 className="font-bold text-foreground text-sm">{deadline.title || `${deadline.deadlineType.replace('_', ' ')} Deadline`}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            {deadline.siteId && <span className="text-xs text-muted-foreground">Site {deadline.siteId}</span>}
                            {deadline.batchId && <span className="text-xs text-muted-foreground font-mono">Batch {deadline.batchId}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {deadline.status !== 'completed' && deadline.status !== 'waived' && (
                          <div className="flex items-center gap-1.5">
                            {urgency ? <AlertCircle className="w-3.5 h-3.5 text-destructive" /> : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                            <span className={cn(
                              "text-xs font-mono",
                              urgency ? "text-destructive font-bold" : "text-muted-foreground"
                            )}>
                              {urgency ? `${Math.abs(daysUntil)}d overdue` : daysUntil === 0 ? "Due today" : `In ${daysUntil}d`}
                            </span>
                          </div>
                        )}
                        <button className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          Manage <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {deadline.conflictsWith && (
                      <div className="mt-4 pt-3 border-t border-border flex items-start gap-2 text-accent">
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="text-xs">
                          <strong className="font-medium">Conflict Detected:</strong> Audit window overlaps with submission deadline #{deadline.conflictsWith}. Re-allocation recommended.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-80 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-card border border-border rounded-sm p-5">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">Conflict Radar</h3>
            
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-sm border border-border mb-4">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium">1 Active Conflict</span>
            </div>
            
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                The compliance engine automatically scans registry schedules for overlapping audit windows and attestation deadlines.
              </div>
              <button className="w-full py-2 bg-secondary hover:bg-primary/20 border border-border hover:border-primary/50 text-foreground transition-all rounded-sm text-sm font-medium">
                Run Radar Scan
              </button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-sm p-5 flex-1">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-4">Registry Summary</h3>
            <div className="space-y-3">
              {['Puro.earth', 'Verra', 'EBC', 'Internal'].map(reg => (
                <div key={reg} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted-foreground">{reg}</span>
                  <span className="font-mono">{deadlines?.filter(d => d.registry.toLowerCase().includes(reg.toLowerCase().split('.')[0])).length || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}