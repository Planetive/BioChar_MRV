import { PageContainer } from "@/components/layout/PageContainer";
import { useListAssuranceIssues, useResolveAssuranceIssue, getListAssuranceIssuesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertTriangle, Filter, Search, CheckCircle2, Bot } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const SeverityColors: Record<string, string> = {
  critical: "text-destructive bg-destructive/10 border-destructive/20",
  high: "text-accent bg-accent/10 border-accent/20",
  medium: "text-primary bg-primary/10 border-primary/20",
  low: "text-muted-foreground bg-secondary border-border",
};

export default function AssuranceStage() {
  const { data: issues, isLoading } = useListAssuranceIssues();
  const resolveIssue = useResolveAssuranceIssue();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const handleResolve = (id: number) => {
    setResolvingId(id);
    resolveIssue.mutate({ id, data: { resolution: "Manually verified and cleared by auditor.", resolvedBy: "CO-8492" } }, {
      onSuccess: () => {
        toast({ title: "Issue Resolved", description: "Assurance flag has been cleared." });
        queryClient.invalidateQueries({ queryKey: getListAssuranceIssuesQueryKey() });
        setResolvingId(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Resolution Failed", description: "Could not clear the assurance flag." });
        setResolvingId(null);
      }
    });
  };

  return (
    <PageContainer 
      title="Assurance Queue" 
      description="Resolve anomaly flags and data discrepancies before verification"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-card border border-border p-5 rounded-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Open Flags</span>
            <AlertTriangle className="w-4 h-4 text-accent" />
          </div>
          <span className="text-3xl font-bold font-mono">
            {issues?.filter(i => i.status === 'open' || i.status === 'in_review').length || 0}
          </span>
        </div>
        <div className="bg-card border border-destructive/30 p-5 rounded-sm shadow-[0_0_15px_-3px_hsl(var(--destructive)/0.1)]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-destructive uppercase tracking-widest">Critical</span>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <span className="text-3xl font-bold font-mono text-destructive">
            {issues?.filter(i => i.severity === 'critical' && i.status !== 'resolved').length || 0}
          </span>
        </div>
        <div className="bg-card border border-primary/30 p-5 rounded-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-primary uppercase tracking-widest">Auto-Resolved</span>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <span className="text-3xl font-bold font-mono text-primary">
            {issues?.filter(i => i.autoSubstituted).length || 0}
          </span>
        </div>
        <div className="bg-card border border-border p-5 rounded-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Cleared Today</span>
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="text-3xl font-bold font-mono">
            {issues?.filter(i => i.status === 'resolved').length || 0}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm flex flex-col h-[600px]">
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-sidebar/30">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search issues by batch, type, or assignee..." 
              className="w-full h-9 bg-background border border-border rounded-sm pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background rounded-sm text-sm font-medium hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              <span>Severity</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background rounded-sm text-sm font-medium hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              <span>Status</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 shadow-sm border-b border-border">
              <tr>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Issue</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Batch / Site</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Severity</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Assignee</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading || !issues ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-48 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-20 bg-secondary float-right" /></td>
                  </tr>
                ))
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <ShieldCheck className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No assurance issues found. All clear.</p>
                  </td>
                </tr>
              ) : (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground mb-1">{issue.title}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">{issue.issueType.replace('_', ' ')}</span>
                        {issue.autoSubstituted && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-primary bg-primary/10 px-1.5 rounded-sm border border-primary/20">
                            <Bot className="w-3 h-3" /> Auto-Substituted
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm">{issue.batchId}</div>
                      {issue.siteId && <div className="text-xs text-muted-foreground font-mono">Site: {issue.siteId}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border rounded-sm", SeverityColors[issue.severity])}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-medium flex items-center gap-1.5",
                        issue.status === 'resolved' ? "text-muted-foreground" : "text-foreground"
                      )}>
                        {issue.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {issue.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{issue.assignedTo || <span className="text-muted-foreground italic">Unassigned</span>}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {issue.status !== 'resolved' ? (
                        <button 
                          onClick={() => handleResolve(issue.id)}
                          disabled={resolvingId === issue.id}
                          className="px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground border border-border hover:border-primary rounded-sm text-xs font-medium transition-all"
                        >
                          {resolvingId === issue.id ? "Resolving..." : "Resolve"}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(issue.resolvedAt || issue.createdAt), 'MM/dd HH:mm')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  );
}