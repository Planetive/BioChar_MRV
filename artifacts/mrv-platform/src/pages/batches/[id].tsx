import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetBatch, useAdvanceBatchStage, getGetBatchQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, ChevronRight, Play, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const STAGES = ["collect", "quantify", "assurance", "verify", "comply", "report"];

export default function BatchDetail() {
  const [, params] = useRoute("/batches/:id");
  const id = Number(params?.id);
  const { data: batch, isLoading } = useGetBatch(id, { query: { enabled: !!id, queryKey: getGetBatchQueryKey(id) } });
  
  const advanceStage = useAdvanceBatchStage();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<string>("overview");

  if (isLoading || !batch) {
    return (
      <PageContainer title="Loading Batch...">
        <Skeleton className="h-24 w-full mb-8 bg-card" />
        <Skeleton className="h-96 w-full bg-card" />
      </PageContainer>
    );
  }

  const currentStageIndex = STAGES.indexOf(batch.stage);
  
  const handleAdvance = () => {
    advanceStage.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Stage Advanced", description: `Batch moved to next stage in pipeline.` });
        queryClient.invalidateQueries({ queryKey: getGetBatchQueryKey(id) });
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Cannot advance stage", description: err.message || "Requirements not met." });
      }
    });
  };

  return (
    <PageContainer 
      title={`Batch ${batch.batchCode}`}
      description={`Site ID: ${batch.siteId} • Created ${format(new Date(batch.createdAt), 'MMM d, yyyy')}`}
      action={
        <div className="flex items-center gap-3">
          <Link href="/batches" className="px-4 py-2 border border-border text-sm font-medium rounded-sm hover:bg-secondary transition-colors">
            Back to Registry
          </Link>
          <button 
            onClick={handleAdvance}
            disabled={advanceStage.isPending || batch.status === 'verified' || batch.status === 'allocated'}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-sm text-sm font-medium hover-elevate transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {advanceStage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Advance Stage</span>
          </button>
        </div>
      }
    >
      {/* Pipeline Tracker */}
      <div className="bg-card border border-border rounded-sm p-6 mb-8">
        <div className="relative flex justify-between">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-in-out" 
              style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` }}
            />
          </div>
          
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={stage} className="relative z-10 flex flex-col items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-card transition-colors duration-500",
                  isCompleted ? "border-primary bg-primary text-primary-foreground" :
                  isCurrent ? "border-primary text-primary ring-4 ring-primary/20" :
                  "border-border text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-mono text-sm">{idx + 1}</span>}
                </div>
                <span className={cn(
                  "text-[11px] font-mono uppercase tracking-widest absolute -bottom-8 w-24 text-center",
                  isCurrent ? "text-primary font-bold" : 
                  isCompleted ? "text-foreground" : "text-muted-foreground"
                )}>
                  {stage}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex gap-8 mt-12 h-[600px]">
        {/* Vertical Tabs */}
        <div className="w-48 flex-shrink-0 flex flex-col gap-1">
          {["overview", ...STAGES].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-left px-4 py-3 rounded-sm text-sm font-medium transition-all flex items-center justify-between group",
                activeTab === tab 
                  ? "bg-secondary text-foreground border-l-2 border-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground border-l-2 border-transparent"
              )}
            >
              <span className="capitalize">{tab}</span>
              <ChevronRight className={cn(
                "w-4 h-4 transition-transform",
                activeTab === tab ? "opacity-100 text-primary translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100"
              )} />
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-card border border-border rounded-sm p-6 overflow-y-auto">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div>
                <h2 className="text-lg font-bold mb-4 border-b border-border pb-2">Batch Summary</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Status</div>
                    <div className="font-medium flex items-center gap-2">
                      {batch.status === 'blocked' && <AlertCircle className="w-4 h-4 text-destructive" />}
                      <span className={batch.status === 'blocked' ? 'text-destructive' : ''}>{batch.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Assigned To</div>
                    <div className="font-medium">{batch.assignedTo || 'Unassigned'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Total Biomass</div>
                    <div className="font-mono">{batch.totalBiomassKg?.toLocaleString() || '-'} kg</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Total Biochar</div>
                    <div className="font-mono">{batch.totalBiocharKg?.toLocaleString() || '-'} kg</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono uppercase mb-1">Net CO2e</div>
                    <div className="font-mono text-primary font-bold">{batch.netCo2e?.toLocaleString() || '-'} t</div>
                  </div>
                </div>
              </div>

              {batch.description && (
                <div>
                  <h3 className="text-sm font-bold text-muted-foreground mb-2 uppercase tracking-wider">Description</h3>
                  <p className="text-sm bg-secondary/30 p-4 rounded-sm border border-border">{batch.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab !== "overview" && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold capitalize text-foreground mb-2">{activeTab} Stage Data</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Detailed views for this stage are handled via the main pipeline navigation. 
              </p>
              <Link href={`/${activeTab}`} className="mt-6 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-sm text-sm font-medium hover:bg-primary/20 transition-colors">
                Go to {activeTab} Workspace
              </Link>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}