import { PageContainer } from "@/components/layout/PageContainer";
import { useListCreditAllocations, useGetRegistryComparison } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, DollarSign, Leaf, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const StatusColors: Record<string, string> = {
  pending: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  submitted: "text-accent bg-accent/10 border-accent/20",
  issued: "text-primary bg-primary/10 border-primary/20",
  retired: "text-muted-foreground bg-secondary border-border",
};

export default function ReportStage() {
  const { data: allocations, isLoading: loadingAllocations } = useListCreditAllocations();
  const { data: comparison, isLoading: loadingComparison } = useGetRegistryComparison();

  const totalIssued = allocations?.filter(a => a.status === 'issued').reduce((sum, a) => sum + a.netCo2e, 0) || 0;
  const totalRevenue = allocations?.filter(a => a.status === 'issued').reduce((sum, a) => sum + (a.revenueUsd || 0), 0) || 0;
  const pendingValue = allocations?.filter(a => a.status === 'pending' || a.status === 'submitted').reduce((sum, a) => sum + (a.creditValue || 0), 0) || 0;

  return (
    <PageContainer 
      title="Report & Allocate" 
      description="Manage credit issuance, registry allocation, and revenue tracking"
      action={
        <button className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 border border-border rounded-sm text-sm font-medium hover:bg-primary/20 hover:text-primary transition-colors">
          <Download className="w-4 h-4" />
          <span>Export Portfolio</span>
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between hover-elevate transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Issued Credits</span>
            <Leaf className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight">{totalIssued.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground ml-2">tCO2e</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between hover-elevate transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Realized Revenue</span>
            <DollarSign className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-primary">${totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between hover-elevate transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Pending Value</span>
            <ArrowRightLeft className="w-4 h-4 text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-accent">${pendingValue.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground ml-2">in pipeline</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-sm flex flex-col h-[500px]">
          <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/30">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Allocation Registry</h3>
            <div className="flex gap-2">
              <select className="bg-background border border-border text-sm rounded-sm px-2 py-1 focus:outline-none focus:border-primary text-foreground">
                <option value="">All Registries</option>
                <option value="puro_earth">Puro.earth</option>
                <option value="verra">Verra</option>
                <option value="ebc">EBC</option>
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 shadow-sm border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Batch / Run</th>
                  <th className="px-5 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Registry</th>
                  <th className="px-5 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground text-right">Net CO2e</th>
                  <th className="px-5 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground text-right">Value (USD)</th>
                  <th className="px-5 py-3 font-mono font-normal text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingAllocations || !allocations ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-24 bg-secondary" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 bg-secondary" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-16 bg-secondary float-right" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 bg-secondary float-right" /></td>
                      <td className="px-5 py-4"><Skeleton className="h-5 w-20 bg-secondary" /></td>
                    </tr>
                  ))
                ) : allocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                      No allocations found. Advancing a batch to Comply stage will generate allocations.
                    </td>
                  </tr>
                ) : (
                  allocations.map((alloc) => (
                    <tr key={alloc.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono text-foreground">Batch {alloc.batchId}</div>
                        <div className="text-xs text-muted-foreground font-mono">Run {alloc.modelRunId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 bg-secondary rounded-sm border border-border">
                          {alloc.registry.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-medium">
                        {alloc.netCo2e.toLocaleString()} <span className="text-muted-foreground font-sans font-normal text-xs">t</span>
                      </td>
                      <td className="px-5 py-4 text-right font-mono">
                        {alloc.status === 'issued' ? (
                          <span className="text-primary">${alloc.revenueUsd?.toLocaleString() || '-'}</span>
                        ) : (
                          <span className="text-accent">${alloc.creditValue?.toLocaleString() || '-'}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn("px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider border rounded-sm flex items-center gap-1.5 w-fit", StatusColors[alloc.status])}>
                          {alloc.status === 'issued' && <CheckCircle2 className="w-3 h-3" />}
                          {alloc.status === 'pending' && <AlertCircle className="w-3 h-3" />}
                          {alloc.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-6 flex flex-col h-[500px]">
          <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground mb-6">Market Intel</h3>
          
          {loadingComparison || !comparison ? (
            <Skeleton className="w-full flex-1 bg-secondary/50" />
          ) : (
            <div className="flex flex-col gap-6 flex-1">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-sm">
                <div className="text-xs font-mono text-primary uppercase tracking-widest mb-1">Recommended Pathway</div>
                <div className="text-lg font-bold capitalize text-foreground">{comparison.topRecommendation.replace('_', ' ')}</div>
                <div className="text-sm text-muted-foreground mt-2">Highest blended yield based on current credit prices and eligibility.</div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Average Credit Prices</div>
                {comparison.registries.map(reg => (
                  <div key={reg.registry} className="flex items-center justify-between">
                    <span className="text-sm capitalize font-medium">{reg.registry.replace('_', ' ')}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground">({reg.eligibleBatches} eligible)</span>
                      <span className="font-mono font-bold text-accent">${reg.avgCreditPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}