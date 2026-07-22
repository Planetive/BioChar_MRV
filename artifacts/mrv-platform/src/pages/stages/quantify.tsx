import { PageContainer } from "@/components/layout/PageContainer";
import { useListModelRuns } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Scale, Play, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const EligibilityColors: Record<string, string> = {
  eligible: "text-primary bg-primary/10 border-primary/20",
  conditional: "text-accent bg-accent/10 border-accent/20",
  ineligible: "text-destructive bg-destructive/10 border-destructive/20",
};

export default function QuantifyStage() {
  const { data: runs, isLoading } = useListModelRuns();

  return (
    <PageContainer 
      title="Quantify & Model" 
      description="Run LCA models to calculate permanence discounts and net CO2e yield"
      action={
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover-elevate transition-all">
          <Play className="w-4 h-4" />
          <span>New Model Run</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        {/* Run History */}
        <div className="lg:col-span-3 bg-card border border-border rounded-sm flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/30">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" /> Model Run History
            </h3>
          </div>
          <div className="flex-1 overflow-auto p-0">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 shadow-sm border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground">Run ID / Batch</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground">Registry Engine</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Gross CO2e</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Discount</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Net CO2e</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading || !runs ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-24 bg-secondary" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-20 bg-secondary" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-16 bg-secondary float-right" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-12 bg-secondary float-right" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-16 bg-secondary float-right" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-4 w-20 bg-secondary" /></td>
                    </tr>
                  ))
                ) : runs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-xs">No model runs found.</td>
                  </tr>
                ) : (
                  runs.map((run) => (
                    <tr key={run.id} className="hover:bg-secondary/40 transition-colors cursor-pointer group">
                      <td className="px-5 py-4">
                        <div className="font-mono text-sm font-bold text-foreground">MR-{run.id}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">Batch {run.batchId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium capitalize">{run.registry.replace('_', ' ')} v2.1</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-muted-foreground">
                        {run.grossCo2e.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-mono text-destructive">
                        -{(run.permanenceDiscount * 100).toFixed(1)}%
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-primary text-base">
                        {run.netCo2e.toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("px-2 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-sm flex items-center gap-1.5 w-fit", EligibilityColors[run.eligibility])}>
                          {run.eligibility === 'eligible' && <CheckCircle2 className="w-3 h-3" />}
                          {run.eligibility === 'ineligible' && <AlertCircle className="w-3 h-3" />}
                          {run.eligibility === 'conditional' && <AlertCircle className="w-3 h-3" />}
                          {run.eligibility}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Config / Inspector */}
        <div className="bg-card border border-border rounded-sm p-6 flex flex-col gap-6">
          <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-3">Inspector</h3>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
            <Scale className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-sm font-medium">Select a run to inspect variables</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-[200px]">C-org ratio, H/C ratio, and ash content modifiers will appear here.</p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}