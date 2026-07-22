import { PageContainer } from "@/components/layout/PageContainer";
import { 
  useGetDashboardSummary, 
  useGetPipelineSummary, 
  useGetRecentActivity, 
  useGetRegistryComparison, 
  useGetComplianceHealth 
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertTriangle, Activity, CheckCircle2, DollarSign, Database, LineChart as LineChartIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: pipeline, isLoading: loadingPipeline } = useGetPipelineSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity({ limit: 5 });
  const { data: comparison, isLoading: loadingComparison } = useGetRegistryComparison();
  const { data: health, isLoading: loadingHealth } = useGetComplianceHealth();

  if (loadingSummary || !summary) {
    return (
      <PageContainer title="Executive Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 w-full bg-card" />)}
        </div>
      </PageContainer>
    );
  }

  const pipelineData = pipeline ? [
    { name: 'Collect', value: pipeline.collect, color: 'hsl(var(--muted))' },
    { name: 'Quantify', value: pipeline.quantify, color: 'hsl(var(--chart-3))' },
    { name: 'Assurance', value: pipeline.assurance, color: 'hsl(var(--chart-2))' },
    { name: 'Verify', value: pipeline.verify, color: 'hsl(var(--chart-5))' },
    { name: 'Comply', value: pipeline.comply, color: 'hsl(var(--primary))' },
    { name: 'Report', value: pipeline.report, color: 'hsl(var(--chart-1))' },
  ] : [];

  return (
    <PageContainer title="Executive Dashboard" description="System-wide aggregate carbon metrics and compliance standing">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between hover-elevate transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Total Net CO2e</span>
            <Database className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight">{summary.totalNetCo2e.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground ml-2">tonnes</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between hover-elevate transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Portfolio Value</span>
            <DollarSign className="w-4 h-4 text-accent opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-accent">${summary.totalRevenueUsd.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between hover-elevate transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Active Batches</span>
            <Activity className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight">{summary.activeBatches || summary.totalBatches}</span>
            <span className="text-xs text-muted-foreground ml-2">across {summary.totalSites} sites</span>
          </div>
        </div>

        <div className="bg-card border border-destructive/30 rounded-sm p-5 flex flex-col justify-between hover-elevate transition-all group">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-destructive uppercase tracking-widest">Critical Issues</span>
            <AlertTriangle className="w-4 h-4 text-destructive opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-mono tracking-tight text-destructive">{summary.criticalIssues || summary.openIssues}</span>
            <span className="text-xs text-muted-foreground ml-2">require attention</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* Pipeline Funnel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <LineChartIcon className="w-4 h-4" /> Pipeline Stage Distribution
            </h3>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            {pipelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-mono)' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'var(--font-mono)' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '4px', fontFamily: 'var(--font-sans)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="w-full h-full bg-secondary/50" />
              </div>
            )}
          </div>
        </div>

        {/* Compliance Health */}
        <div className="bg-card border border-border rounded-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Health Score
            </h3>
          </div>
          
          {loadingHealth || !health ? (
            <Skeleton className="flex-1 w-full bg-secondary/50" />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    className="text-secondary stroke-current"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${health.overallScore > 90 ? 'text-primary' : health.overallScore > 70 ? 'text-accent' : 'text-destructive'} stroke-current`}
                    strokeWidth="3"
                    strokeDasharray={`${health.overallScore}, 100`}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold font-mono">{health.overallScore}</span>
                </div>
              </div>
              
              <div className="w-full space-y-3 mt-auto">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Upcoming Deadlines</span>
                  <span className="font-mono font-bold text-foreground">{health.upcomingCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Overdue</span>
                  <span className={`font-mono font-bold ${health.overdueCount > 0 ? 'text-destructive' : 'text-foreground'}`}>{health.overdueCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Conflicts</span>
                  <span className={`font-mono font-bold ${health.conflictCount > 0 ? 'text-accent' : 'text-foreground'}`}>{health.conflictCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Registry Comparison */}
        <div className="bg-card border border-border rounded-sm flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Registry Benchmarks</h3>
            {comparison?.topRecommendation && (
              <span className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-[10px] font-mono uppercase rounded-sm">
                Rec: {comparison.topRecommendation.replace('_', ' ')}
              </span>
            )}
          </div>
          <div className="p-0">
            {loadingComparison || !comparison ? (
              <div className="p-5"><Skeleton className="h-40 w-full bg-secondary/50" /></div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-sidebar/50">
                    <th className="text-left font-mono font-normal text-muted-foreground px-5 py-3">Registry</th>
                    <th className="text-right font-mono font-normal text-muted-foreground px-5 py-3">Batches</th>
                    <th className="text-right font-mono font-normal text-muted-foreground px-5 py-3">Est. Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {comparison.registries.map((reg) => (
                    <tr key={reg.registry} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-4 font-medium capitalize">{reg.registry.replace('_', ' ')}</td>
                      <td className="px-5 py-4 text-right font-mono">{reg.eligibleBatches}</td>
                      <td className="px-5 py-4 text-right font-mono text-accent">${reg.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-card border border-border rounded-sm flex flex-col">
          <div className="p-5 border-b border-border">
            <h3 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">Recent Activity</h3>
          </div>
          <div className="p-0">
            {loadingActivity || !activity ? (
              <div className="p-5 space-y-4">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full bg-secondary/50" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activity.map((item) => (
                  <div key={item.id} className="p-4 px-5 flex gap-4 hover:bg-secondary/30 transition-colors">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.description}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs font-mono text-muted-foreground">{format(new Date(item.timestamp), 'HH:mm')}</span>
                        {item.batchCode && (
                          <span className="text-xs font-mono px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded-sm">
                            {item.batchCode}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground truncate">{item.actor}</span>
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