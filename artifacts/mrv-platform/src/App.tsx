import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Shell from '@/components/layout/Shell';

// Pages
import Dashboard from '@/pages/dashboard';
import Batches from '@/pages/batches';
import BatchDetail from '@/pages/batches/[id]';
import CollectStage from '@/pages/stages/collect';
import QuantifyStage from '@/pages/stages/quantify';
import AssuranceStage from '@/pages/stages/assurance';
import VerifyStage from '@/pages/stages/verify';
import ComplyStage from '@/pages/stages/comply';
import ReportStage from '@/pages/stages/report';
import Sites from '@/pages/sites';
import Notifications from '@/pages/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/batches" component={Batches} />
        <Route path="/batches/:id" component={BatchDetail} />
        <Route path="/collect" component={CollectStage} />
        <Route path="/quantify" component={QuantifyStage} />
        <Route path="/assurance" component={AssuranceStage} />
        <Route path="/verify" component={VerifyStage} />
        <Route path="/comply" component={ComplyStage} />
        <Route path="/report" component={ReportStage} />
        <Route path="/sites" component={Sites} />
        <Route path="/notifications" component={Notifications} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;