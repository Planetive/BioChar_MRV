import { PageContainer } from "@/components/layout/PageContainer";
import { useListBatches, Batch } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { format } from "date-fns";
import { Search, Plus, Filter, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const StageColors: Record<string, string> = {
  collect: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  quantify: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  assurance: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  verify: "text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/20",
  comply: "text-primary bg-primary/10 border-primary/20",
  report: "text-accent bg-accent/10 border-accent/20",
};

const StatusColors: Record<string, string> = {
  in_progress: "text-muted-foreground bg-secondary",
  blocked: "text-destructive bg-destructive/10",
  completed: "text-primary bg-primary/10",
  verified: "text-accent bg-accent/10",
  allocated: "text-foreground bg-secondary",
};

export default function Batches() {
  const { data: batches, isLoading } = useListBatches();

  return (
    <PageContainer 
      title="Batch Registry" 
      description="Track and manage all carbon removal batches across the pipeline"
      action={
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover-elevate transition-all">
          <Plus className="w-4 h-4" />
          <span>New Batch</span>
        </button>
      }
    >
      <div className="bg-card border border-border rounded-sm flex flex-col h-full min-h-[500px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-4 bg-sidebar/30">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Filter batches by code..." 
              className="w-full h-9 bg-background border border-border rounded-sm pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-border bg-background rounded-sm text-sm font-medium hover:bg-secondary transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 shadow-sm border-b border-border">
              <tr>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Batch Code</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Stage</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground text-right">Net CO2e</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground text-right">Updated</th>
                <th className="px-6 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading || !batches ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 bg-secondary" /></td>
                    <td className="px-6 py-4 flex justify-end"><Skeleton className="h-5 w-16 bg-secondary" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-secondary float-right" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 bg-secondary float-right" /></td>
                  </tr>
                ))
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No batches found. Create one to begin.
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-secondary/40 transition-colors group">
                    <td className="px-6 py-4">
                      <Link href={`/batches/${batch.id}`} className="font-mono font-bold text-foreground hover:text-primary transition-colors flex items-center gap-2">
                        {batch.batchCode}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border rounded-sm", StageColors[batch.stage] || "bg-secondary text-foreground")}>
                        {batch.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-sm", StatusColors[batch.status] || "bg-secondary text-foreground")}>
                        {batch.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {batch.netCo2e ? batch.netCo2e.toLocaleString() : '-'} <span className="text-muted-foreground font-sans font-normal text-xs">t</span>
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {format(new Date(batch.updatedAt || batch.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/batches/${batch.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
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