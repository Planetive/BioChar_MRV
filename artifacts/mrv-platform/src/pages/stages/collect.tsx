import { PageContainer } from "@/components/layout/PageContainer";
import { useListFeedstockEntries, useListProductionRecords } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Hexagon, Plus, Flame, Scale, Droplets } from "lucide-react";
import { format } from "date-fns";

export default function CollectStage() {
  const { data: feedstock, isLoading: loadingFeedstock } = useListFeedstockEntries();
  const { data: production, isLoading: loadingProduction } = useListProductionRecords();

  return (
    <PageContainer 
      title="Collect & Intake" 
      description="Record primary operational data: feedstock, pyrolysis conditions, and output"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[700px]">
        {/* Feedstock Table */}
        <div className="bg-card border border-border rounded-sm flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/30">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <LeafIcon className="w-4 h-4" /> Feedstock Log
            </h3>
            <button className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 shadow-sm border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground">Source</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Mass (kg)</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Moisture</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingFeedstock || !feedstock ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-24 bg-secondary" /></td>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-16 bg-secondary float-right" /></td>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-12 bg-secondary float-right" /></td>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-20 bg-secondary float-right" /></td>
                    </tr>
                  ))
                ) : feedstock.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-xs">No feedstock records found.</td>
                  </tr>
                ) : (
                  feedstock.map((entry) => (
                    <tr key={entry.id} className="hover:bg-secondary/40 transition-colors group cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="font-medium text-foreground">{entry.biomassSource}</div>
                        <div className="text-[10px] font-mono text-muted-foreground uppercase">{entry.biomassType}</div>
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-primary group-hover:font-bold transition-all">
                        {entry.quantityKg.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono flex items-center justify-end gap-1 text-muted-foreground">
                        <Droplets className="w-3 h-3" /> {entry.moisturePercent}%
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-muted-foreground">
                        {entry.collectionDate ? format(new Date(entry.collectionDate), 'MM/dd/yyyy') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Production Table */}
        <div className="bg-card border border-border rounded-sm flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between bg-sidebar/30">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Flame className="w-4 h-4" /> Pyrolysis Records
            </h3>
            <button className="p-1.5 hover:bg-secondary rounded-sm text-muted-foreground hover:text-foreground transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 shadow-sm border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground">Batch Ref</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Temp (°C)</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Time (min)</th>
                  <th className="px-5 py-3 font-mono font-normal text-[10px] uppercase tracking-wider text-muted-foreground text-right">Yield (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingProduction || !production ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-16 bg-secondary" /></td>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-12 bg-secondary float-right" /></td>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-12 bg-secondary float-right" /></td>
                      <td className="px-5 py-3"><Skeleton className="h-4 w-16 bg-secondary float-right" /></td>
                    </tr>
                  ))
                ) : production.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-xs">No production records found.</td>
                  </tr>
                ) : (
                  production.map((record) => (
                    <tr key={record.id} className="hover:bg-secondary/40 transition-colors group cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="font-mono text-xs text-foreground">B-{record.batchId}</div>
                        {record.equipmentId && <div className="text-[10px] font-mono text-muted-foreground">EQ-{record.equipmentId}</div>}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-accent">
                        {record.pyrolysisTemp}°
                      </td>
                      <td className="px-5 py-3 text-right font-mono">
                        {record.residenceTimeMin}m
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-medium text-foreground">
                        {record.outputBiocharKg?.toLocaleString() || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function LeafIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}